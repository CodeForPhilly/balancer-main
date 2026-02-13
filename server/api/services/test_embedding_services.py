from unittest.mock import MagicMock, patch

from api.services.embedding_services import evaluate_query, log_usage


def test_evaluate_query_maps_fields():
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
    obj = MagicMock()
    obj.name = "doc.pdf"
    obj.text = "some text"
    obj.page_num = 1
    obj.chunk_number = 0
    obj.distance = 1.0
    obj.upload_file = None

    results = evaluate_query([obj])

    assert results[0]["file_id"] is None


@patch("api.services.embedding_services.SemanticSearchUsage.objects.create")
def test_log_usage_computes_distance_stats(mock_create):
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
    results = [{"distance": 1.0}]
    user = MagicMock(is_authenticated=True)

    # pytest fails the test if it catches unhandled Exception
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
