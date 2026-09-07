import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_sql(question: str):

    schema = """
ShopSense PostgreSQL Database:

vendors:
- vendor_id
- name
- status
- created_at

products:
- product_id
- vendor_id
- name
- price
- stock
- category
- created_at

customers:
- customer_id
- name
- area
- created_at

transactions:
- transaction_id
- customer_id
- product_id
- quantity
- total_amount
- purchase_date

Relationships:

products.vendor_id = vendors.vendor_id

transactions.product_id = products.product_id

transactions.customer_id = customers.customer_id
"""

    prompt = f"""
You are the SQL analyst for the ShopSense marketplace.

Your job is to convert the user's business question
into a valid PostgreSQL SELECT query.

{schema}

IMPORTANT RULES:

1. Generate ONLY a SELECT query.
2. Do not generate INSERT, UPDATE, DELETE, DROP,
   ALTER, TRUNCATE, CREATE, or any other modification query.
3. Use only the tables and columns provided above.
4. Do not access passwords, emails, phone numbers,
   or addresses.
5. Use JOINs when information from multiple tables
   is required.
6. Use appropriate GROUP BY, ORDER BY and aggregate
   functions when required.
7. Return ONLY the SQL query.
8. Do not use markdown code fences.
9. Do not provide explanations.

User question:

{question}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
    )
    sql = response.text.strip()
    sql = sql.replace("```sql", "").replace("```", "").strip()
    validate_sql(sql)
    return sql

def validate_sql(sql: str):

    sql = sql.strip()

    # Remove trailing semicolon
    sql = sql.rstrip(";").strip()

    # Query must not be empty
    if not sql:
        raise ValueError("Generated SQL is empty.")

    # Only SELECT queries are allowed
    if not sql.lower().startswith("select"):
        raise ValueError(
            "Only SELECT queries are allowed."
        )

    # Only one SQL statement is allowed
    if ";" in sql:
        raise ValueError(
            "Multiple SQL statements are not allowed."
        )

    forbidden_keywords = [
        "insert",
        "update",
        "delete",
        "drop",
        "alter",
        "truncate",
        "create",
        "grant",
        "revoke"
    ]

    sql_lower = sql.lower()

    for keyword in forbidden_keywords:

        if keyword in sql_lower:

            raise ValueError(
                f"Unsafe SQL detected: {keyword}"
            )

    return sql