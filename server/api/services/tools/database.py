from django.db import connection

# Define a list of allowed tables
ALLOWED_TABLES = ['api_medication']

def get_table_names(conn):
    """Return a list of table names from the PostgreSQL database."""
    table_names = []
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        """)
        tables = cursor.fetchall()
        for table in tables:
            if table[0] in ALLOWED_TABLES:
                table_names.append(table[0])
    return table_names


def get_column_names(conn, table_name):
    """Return a list of column names for a given table in the PostgreSQL database."""
    if table_name not in ALLOWED_TABLES:
        return []
    
    column_names = []
    with conn.cursor() as cursor:
        cursor.execute(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}';
        """)
        columns = cursor.fetchall()
        for col in columns:
            column_names.append(col[0])
    return column_names


def get_database_info(conn):
    """Return a list of dicts containing the table name and columns for each table in the PostgreSQL database."""
    table_dicts = []
    for table_name in get_table_names(conn):
        column_names = get_column_names(conn, table_name)
        table_dicts.append({"table_name": table_name, "column_names": column_names})
    return table_dicts


def ask_database(query, params=None, conn=connection):
    """Only allow SELECT queries to prevent data modification or deletion."""
    query_lower = query.strip().lower()
    if not query_lower.startswith("select"):
        return "Only SELECT queries are allowed."
    
    # Check if the query only accesses allowed tables
    for table in ALLOWED_TABLES:
        if f"from {table}" in query_lower:
            break
    else:
        return "Query accesses unauthorized tables."
    
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()
        return str(results)
    except Exception as e:
        return f"Query failed with error: {e}"

