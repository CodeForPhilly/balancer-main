import uuid


def convert_uuids(data):
    """
    Recursively convert UUID objects to strings in nested data structures.

    Traverses dictionaries, lists, and other data structures to find UUID objects
    and converts them to their string representation for serialization.

    Parameters
    ----------
    data : any
        The data structure to process (dict, list, UUID, or any other type)

    Returns
    -------
    any
        The data structure with all UUID objects converted to strings.
        Structure and types are preserved except for UUID -> str conversion.
    """
    if isinstance(data, dict):
        return {key: convert_uuids(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_uuids(item) for item in data]
    elif isinstance(data, uuid.UUID):
        return str(data)
    else:
        return data
