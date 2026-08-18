import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_product_content(product_name: str, category: str):

    prompt = f"""
Generate an SEO-friendly product listing for the following product.

Product Name:
{product_name}

Category:
{category}

Generate the following:

Description:
A professional product description in 3-4 lines.

Tags:
Comma-separated SEO tags.

Keywords:
Comma-separated SEO keywords.

Return ONLY in this format:

Description:
...

Tags:
...

Keywords:
...
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
    )

    text = response.text

    description = ""
    tags = ""
    keywords = ""

    sections = text.split("\n\n")

    for section in sections:

        section = section.strip()

        if "Description" in section:
            description = (
                section.replace("**Description:**", "")
                .replace("Description:", "")
                .strip()
            )

        elif "Tags" in section:
            tags = (
                section.replace("**Tags:**", "")
                .replace("Tags:", "")
                .strip()
            )

        elif "Keywords" in section:
            keywords = (
                section.replace("**Keywords:**", "")
                .replace("Keywords:", "")
                .strip()
            )

    return {
        "description": description,
        "seo_tags": tags,
        "seo_keywords": keywords
    }