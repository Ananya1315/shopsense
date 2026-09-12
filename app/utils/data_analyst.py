import os
import re

from dotenv import load_dotenv
from google import genai


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_sql(question: str, vendor_id: int):

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

You are currently assisting ONE vendor only.

Current vendor_id:
{vendor_id}

{schema}

IMPORTANT VENDOR DATA RULES:

1. Every query MUST return data belonging ONLY to the current vendor.

2. Whenever the query uses products or transactions,
   it MUST restrict the products to the current vendor.

3. For vendor-specific queries, use this condition:

   products.vendor_id = {vendor_id}

   or, if the products table has alias p:

   p.vendor_id = {vendor_id}

4. If transactions are used, ALWAYS connect transactions
   to products and restrict the products to the current vendor.

   Example:

   FROM transactions t
   JOIN products p ON t.product_id = p.product_id
   WHERE p.vendor_id = {vendor_id}

5. Customer analytics must also be restricted to customers
   who have transactions involving this vendor's products.

6. Sales, revenue, products, inventory, customers,
   categories and other business information must be
   calculated ONLY for the current vendor.

7. Do NOT return marketplace-wide totals.

8. Do NOT include other vendors' products,
   sales, revenue, inventory or customers.

9. Generate ONLY a SELECT query.

10. Do not generate INSERT, UPDATE, DELETE, DROP,
    ALTER, TRUNCATE, CREATE, GRANT, REVOKE or any
    other modification query.

11. Use only the tables and columns provided above.

12. Do not access passwords, emails, phone numbers,
    or addresses.

13. Use JOINs when information from multiple tables
    is required.

14. Use appropriate GROUP BY, ORDER BY and aggregate
    functions when required.

15. Return ONLY the SQL query.

16. Do not use markdown code fences.

17. Do not provide explanations.

18. Do not use UNION, INTERSECT, EXCEPT or subqueries.

19. The current vendor restriction must appear directly
    in the WHERE clause.

User question:

{question}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
    )

    sql = response.text.strip()

    # Remove markdown fences if Gemini accidentally adds them
    sql = sql.replace("```sql", "")
    sql = sql.replace("```", "")
    sql = sql.strip()

    # Validate the generated query
    validate_sql(sql, vendor_id)

    return sql


def validate_sql(sql: str, vendor_id: int):

    sql = sql.strip()

    # -----------------------------------------
    # BASIC VALIDATION
    # -----------------------------------------

    if not sql:
        raise ValueError(
            "Generated SQL is empty."
        )

    # Only SELECT queries
    if not sql.lower().startswith("select"):
        raise ValueError(
            "Only SELECT queries are allowed."
        )

    # Remove one trailing semicolon
    sql = sql.rstrip(";").strip()

    # No additional semicolons
    if ";" in sql:
        raise ValueError(
            "Multiple SQL statements are not allowed."
        )

    sql_lower = sql.lower()

    # -----------------------------------------
    # FORBIDDEN SQL OPERATIONS
    # -----------------------------------------

    forbidden_keywords = [
        "insert",
        "update",
        "delete",
        "drop",
        "alter",
        "truncate",
        "create",
        "grant",
        "revoke",
        "union",
        "intersect",
        "except",
        "with"
    ]

    for keyword in forbidden_keywords:

        pattern = rf"\b{keyword}\b"

        if re.search(pattern, sql_lower):

            raise ValueError(
                f"Unsafe SQL detected: {keyword}"
            )

    # -----------------------------------------
    # BLOCK COMMENTS
    # -----------------------------------------

    if "--" in sql or "/*" in sql or "*/" in sql:

        raise ValueError(
            "SQL comments are not allowed."
        )

    # -----------------------------------------
    # VENDOR RESTRICTION
    # -----------------------------------------

    vendor_pattern = rf"\bvendor_id\s*=\s*{vendor_id}\b"

    if not re.search(
        vendor_pattern,
        sql_lower
    ):

        raise ValueError(
            "Query is missing the required vendor restriction."
        )

    # -----------------------------------------
    # BLOCK SUSPICIOUS BYPASS CONDITIONS
    # -----------------------------------------

    suspicious_patterns = [
        r"\bor\s+1\s*=\s*1\b",
        r"\bor\s+true\b",
        r"\bor\s+'1'\s*=\s*'1'\b"
    ]

    for pattern in suspicious_patterns:

        if re.search(pattern, sql_lower):

            raise ValueError(
                "Unsafe SQL condition detected."
            )

    return sql