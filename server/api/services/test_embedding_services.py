from unittest.mock import MagicMock, patch

from django.db.models import Q
from pgvector.django import L2Distance

from api.services.embedding_services import (
    build_query,
    evaluate_query,
    get_closest_embeddings,
    log_usage,
)

# ---------------------------------------------------------------------------
# build_query tests
# ---------------------------------------------------------------------------

# All assertions inspect which methods and arguments were called on Embeddings.objects

# Only forwarded to L2Distance
EMBEDDING_VECTOR = [0.1, 0.2, 0.3]  

# Test authenticated/unauthenticated user access control

@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_authenticated_uses_or_filter(mock_objects):
    # An authenticated user should see their own files OR files uploaded by a
    # superuser. The initial filter must use an OR-connected Q expression.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR)

    # Q objects support equality comparison in pure Python — no DB needed.
    expected_q = Q(upload_file__uploaded_by=user) | Q(upload_file__uploaded_by__is_superuser=True)
    actual_q = mock_objects.filter.call_args.args[0]
    assert actual_q == expected_q


@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_unauthenticated_uses_superuser_only_filter(mock_objects):
    # An unauthenticated user may only see files uploaded by superusers.
    # The source uses a plain kwarg here (not a positional Q object), so the
    # value lives in call_args.kwargs, not call_args.args.
    user = MagicMock(is_authenticated=False)

    build_query(user, EMBEDDING_VECTOR)

    assert mock_objects.filter.call_args.kwargs == {"upload_file__uploaded_by__is_superuser": True}
    
# Test application of annotate and order_by

@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_annotates_and_orders_by_distance(mock_objects):
    # Regardless of other arguments, annotate(distance=L2Distance(...)) and
    # order_by("distance") must always be applied to the queryset.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR)

    # Retrieve the mock chain that .filter() returned, then check its methods.
    filtered_qs = mock_objects.filter.return_value
    filtered_qs.annotate.assert_called_once()
    filtered_qs.annotate.return_value.order_by.assert_called_once_with("distance")

    # L2Distance is a Django Func subclass, which implements __eq__ by comparing
    # class and source expressions — so we can assert the exact field name and
    # vector without patching L2Distance itself.
    actual_distance_expr = filtered_qs.annotate.call_args.kwargs["distance"]
    assert actual_distance_expr == L2Distance("embedding_sentence_transformers", EMBEDDING_VECTOR)

# Test guid-over-document precedence logic

@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_no_document_filter_when_both_none(mock_objects):
    # When neither guid nor document_name is provided, only the access-control
    # filter should fire — no secondary filter call for a document.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR, document_name=None, guid=None)

    # Exactly one filter call: the auth/access-control filter.
    assert mock_objects.filter.call_count == 1



@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_guid_takes_precedence_over_document_name(mock_objects):
    # When both guid and document_name are provided, the guid branch runs and
    # the document_name branch is skipped entirely.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR, guid="abc-123", document_name="study.pdf")

    # The auth filter fires on mock_objects.filter (call_count == 1).
    # The document filter fires on the chained ordered_qs.filter — a different
    # mock object — so mock_objects.filter.call_count stays at 1.
    assert mock_objects.filter.call_count == 1

    # The document filter must use upload_file__guid, not name, and must be
    # called exactly once (confirming document_name branch was skipped).
    ordered_qs = mock_objects.filter.return_value.annotate.return_value.order_by.return_value
    ordered_qs.filter.assert_called_once_with(upload_file__guid="abc-123")


@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_guid_filter_applied(mock_objects):
    # When only guid is given, a second filter on upload_file__guid is applied.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR, guid="doc-guid-456")

    ordered_qs = mock_objects.filter.return_value.annotate.return_value.order_by.return_value
    ordered_qs.filter.assert_called_once_with(upload_file__guid="doc-guid-456")


@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_document_name_filter_applied(mock_objects):
    # When only document_name is given (guid is None), a second filter on
    # name is applied instead of upload_file__guid.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR, document_name="study.pdf", guid=None)

    ordered_qs = mock_objects.filter.return_value.annotate.return_value.order_by.return_value
    ordered_qs.filter.assert_called_once_with(name="study.pdf")
    
    
@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_empty_string_guid_falls_back_to_document_name(mock_objects):
    # An empty-string guid is falsy in Python, so it should not trigger the
    # guid branch. The document_name filter should fire instead. This guards
    # against callers passing guid="" from an unset form field.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR, guid="", document_name="fallback.pdf")

    ordered_qs = mock_objects.filter.return_value.annotate.return_value.order_by.return_value
    ordered_qs.filter.assert_called_once_with(name="fallback.pdf")

# Cover LIMIT slicing

@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_respects_num_results(mock_objects):
    # num_results controls the SQL LIMIT via queryset slicing. Verify that a
    # non-default value propagates correctly to the __getitem__ call.
    user = MagicMock(is_authenticated=True)

    build_query(user, EMBEDDING_VECTOR, num_results=5)

    # Django translates qs[:5] into qs.__getitem__(slice(None, 5, None)).
    ordered_qs = mock_objects.filter.return_value.annotate.return_value.order_by.return_value
    ordered_qs.__getitem__.assert_called_once_with(slice(None, 5, None))

@patch("api.services.embedding_services.Embeddings.objects")
def test_build_query_returns_unevaluated_queryset(mock_objects):
    # build_query must NOT evaluate the queryset (no list(), no iteration).
    # The return value should be the mock produced by the final __getitem__ call.
    user = MagicMock(is_authenticated=True)

    result = build_query(user, EMBEDDING_VECTOR)

    ordered_qs = mock_objects.filter.return_value.annotate.return_value.order_by.return_value
    assert result is ordered_qs.__getitem__.return_value
    assert not isinstance(result, list)


# ---------------------------------------------------------------------------
# evaluate_query tests
# ---------------------------------------------------------------------------

def test_evaluate_query_empty_queryset():
    # An empty iterable should return an empty list, not raise an exception.
    assert evaluate_query([]) == []


def test_evaluate_query_maps_fields():
    # Verify that each Embeddings model attribute is mapped to the correct
    # output dict key. Note the rename: obj.page_num -> result["page_number"].
    obj = MagicMock()
    obj.name = "doc.pdf"
    obj.text = "some text"
    obj.page_num = 3
    obj.chunk_number = 1
    obj.distance = 0.42
    obj.upload_file.guid = "abc-123"

    results = evaluate_query([obj])

    assert results == [
        {
            "name": "doc.pdf",
            "text": "some text",
            "page_number": 3,
            "chunk_number": 1,
            "distance": 0.42,
            "file_id": "abc-123",
        }
    ]


def test_evaluate_query_none_upload_file():
    # When upload_file is None, file_id must be None rather than raising
    # an AttributeError on None.guid.
    obj = MagicMock()
    obj.name = "doc.pdf"
    obj.text = "some text"
    obj.page_num = 1
    obj.chunk_number = 0
    obj.distance = 1.0
    obj.upload_file = None

    results = evaluate_query([obj])

    assert results[0]["file_id"] is None

# ---------------------------------------------------------------------------
# log_usage tests
# ---------------------------------------------------------------------------

@patch("api.services.embedding_services.SemanticSearchUsage.objects.create")
def test_log_usage_empty_results(mock_create):
    # Empty results hits the else branch. The record should still be created
    # with num_results_returned=0 and all distance fields set to None.
    user = MagicMock(is_authenticated=True)

    log_usage(
        [],
        message_data="test query",
        user=user,
        guid=None,
        document_name=None,
        num_results=10,
        encoding_time=0.1,
        db_query_time=0.2,
    )

    mock_create.assert_called_once()
    kwargs = mock_create.call_args.kwargs
    assert kwargs["num_results_returned"] == 0
    assert kwargs["max_distance"] is None
    assert kwargs["median_distance"] is None
    assert kwargs["min_distance"] is None


@patch("api.services.embedding_services.SemanticSearchUsage.objects.create")
def test_log_usage_unauthenticated_user_stored_as_none(mock_create):
    # An unauthenticated user should be stored as None in the DB record, not as
    # the user object itself, so the FK constraint is not violated.
    user = MagicMock(is_authenticated=False)

    log_usage(
        [{"distance": 1.0}],
        message_data="test query",
        user=user,
        guid=None,
        document_name=None,
        num_results=10,
        encoding_time=0.1,
        db_query_time=0.2,
    )

    kwargs = mock_create.call_args.kwargs
    assert kwargs["user"] is None


@patch("api.services.embedding_services.SemanticSearchUsage.objects.create")
def test_log_usage_none_user_stored_as_none(mock_create):
    # Passing user=None directly (e.g. from an anonymous request) should also
    # store None — the expression `user if (user and user.is_authenticated)`
    # short-circuits on the falsy None before accessing .is_authenticated.
    log_usage(
        [{"distance": 1.0}],
        message_data="test query",
        user=None,
        guid=None,
        document_name=None,
        num_results=10,
        encoding_time=0.1,
        db_query_time=0.2,
    )

    kwargs = mock_create.call_args.kwargs
    assert kwargs["user"] is None


@patch("api.services.embedding_services.SemanticSearchUsage.objects.create")
def test_log_usage_computes_distance_stats(mock_create):
    # Verify min, max, and median are computed correctly from the distance
    # values in the results list and forwarded to the DB record.
    results = [{"distance": 1.0}, {"distance": 3.0}, {"distance": 2.0}]
    user = MagicMock(is_authenticated=True)

    log_usage(
        results,
        message_data="test query",
        user=user,
        guid=None,
        document_name=None,
        num_results=10,
        encoding_time=0.1,
        db_query_time=0.2,
    )

    mock_create.assert_called_once()
    kwargs = mock_create.call_args.kwargs
    assert kwargs["min_distance"] == 1.0
    assert kwargs["max_distance"] == 3.0
    assert kwargs["median_distance"] == 2.0
    assert kwargs["num_results_returned"] == 3


@patch(
    "api.services.embedding_services.SemanticSearchUsage.objects.create",
    side_effect=Exception("DB error"),
)
def test_log_usage_swallows_exceptions(mock_create):
    # log_usage must not propagate exceptions — a logging failure should never
    # interrupt the caller's search flow.
    # pytest fails the test if it catches unhandled Exception
    results = [{"distance": 1.0}]
    user = MagicMock(is_authenticated=True)

    log_usage(
        results,
        message_data="test query",
        user=user,
        guid=None,
        document_name=None,
        num_results=10,
        encoding_time=0.1,
        db_query_time=0.2,
    )


# ---------------------------------------------------------------------------
# get_closest_embeddings tests
# ---------------------------------------------------------------------------

@patch("api.services.embedding_services.log_usage")
@patch("api.services.embedding_services.evaluate_query")
@patch("api.services.embedding_services.build_query")
@patch("api.services.embedding_services.TransformerModel")
def test_get_closest_embeddings_wiring(mock_transformer, mock_build, mock_evaluate, mock_log):
    # Smoke test verifying that get_closest_embeddings correctly wires together
    # encode → build_query → evaluate_query → log_usage and returns the results.
    user = MagicMock(is_authenticated=True)

    # Simulate the model encoding the message to a vector.
    fake_vector = [0.1, 0.2, 0.3]
    mock_transformer.get_instance.return_value.model.encode.return_value = fake_vector

    # build_query returns a queryset; evaluate_query turns it into a results list.
    fake_queryset = MagicMock()
    mock_build.return_value = fake_queryset
    fake_results = [{"name": "doc.pdf", "distance": 0.5}]
    mock_evaluate.return_value = fake_results

    result = get_closest_embeddings(user, "some query", document_name="doc.pdf", guid=None, num_results=5)

    # The encoded vector must be forwarded to build_query.
    mock_build.assert_called_once_with(user, fake_vector, "doc.pdf", None, 5)

    # evaluate_query must receive the queryset that build_query returned.
    mock_evaluate.assert_called_once_with(fake_queryset)

    # log_usage must be called with the results and original parameters.
    mock_log.assert_called_once()
    log_kwargs = mock_log.call_args.args
    assert log_kwargs[0] is fake_results

    # The function must return evaluate_query's result unchanged.
    assert result is fake_results
