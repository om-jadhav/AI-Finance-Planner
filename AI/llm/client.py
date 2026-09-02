"""
LLM client abstraction using Groq.
"""

from typing import Optional

from groq import Groq

from config.settings import (
    LLM_API_KEY,
    LLM_MODEL,
    LLM_ENABLED,
    LLM_MAX_COMPLETION_TOKENS,
)


def generate_llm_response(
    system_prompt: str,
    user_prompt: str,
) -> Optional[str]:
    """
    Generate LLM response.

    Returns None when LLM is disabled or unavailable.
    """

    if not LLM_ENABLED:
        return None

    if not LLM_API_KEY:
        return None

    try:
        client = Groq(
            api_key=LLM_API_KEY
        )

        response = (
            client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
                temperature=0.2,
                # Three variants can contain many allocations.  A 2,000-token
                # limit can truncate the final variant part-way through.
                max_completion_tokens=LLM_MAX_COMPLETION_TOKENS,
                response_format={"type": "json_object"},
            )
        )

        return (
            response
            .choices[0]
            .message
            .content
        )

    except Exception as error:
        print("========== LLM ERROR ==========")
        print(f"Error type: {type(error).__name__}")
        print(f"Error: {error}")
        print("================================")
        return None


def generate_chat_reply(
    system_prompt: str,
    messages: list,
) -> Optional[str]:
    """
    Multi-turn conversational reply, for the RAG chatbot.

    Kept separate from generate_llm_response() (used for the single-shot,
    JSON-only plan generation call) since chat replies are plain
    conversational text with a growing turn history, not one user_prompt
    string.

    Returns None when LLM is disabled or unavailable, same as
    generate_llm_response().
    """

    if not LLM_ENABLED:
        return None

    if not LLM_API_KEY:
        return None

    try:
        client = Groq(
            api_key=LLM_API_KEY
        )

        response = (
            client.chat.completions.create(
                model=LLM_MODEL,
                messages=(
                    [{"role": "system", "content": system_prompt}]
                    + messages
                ),
                temperature=0.4,
                max_completion_tokens=500,
                # No response_format=json_object -- chat replies are
                # plain conversational text, not a structured JSON object.
            )
        )

        return (
            response
            .choices[0]
            .message
            .content
        )

    except Exception as error:
        print("========== LLM CHAT ERROR ==========")
        print(f"Error type: {type(error).__name__}")
        print(f"Error: {error}")
        print("=====================================")
        return None
