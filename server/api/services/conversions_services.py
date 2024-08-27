import uuid


def convert_uuids(data):
    if isinstance(data, dict):
        return {key: convert_uuids(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_uuids(item) for item in data]
    elif isinstance(data, uuid.UUID):
        return str(data)
    else:
        return data
