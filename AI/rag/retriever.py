"""
Lightweight RAG retriever.

Implemented from scratch with only the standard library plus numpy
(already a project dependency) -- no vector database, no
sentence-transformers, no LangChain. knowledge_base/*.md is chunked by
heading, turned into TF-IDF vectors, and the top-matching chunks for a
user's question are retrieved by cosine similarity.

Sparse (keyword-based) retrieval, not dense embedding retrieval. For a
small, curated knowledge base like this one, that's accurate enough and
has zero extra install/runtime cost.
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np

from config.settings import BASE_DIR

KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> List[str]:
    return _TOKEN_RE.findall(text.lower())


@dataclass
class Chunk:
    source: str
    heading: str
    text: str


def _load_and_chunk_documents() -> List[Chunk]:
    """Split each knowledge_base/*.md file along its '## ' subheadings
    (falls back to the whole file if it has none), so each chunk is a
    coherent, self-contained topic rather than an arbitrary character split.
    """
    chunks: List[Chunk] = []

    if not KNOWLEDGE_BASE_DIR.exists():
        return chunks

    for path in sorted(KNOWLEDGE_BASE_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        sections = re.split(r"\n(?=## )", text)

        for section in sections:
            section = section.strip()
            if not section:
                continue
            heading_match = re.match(r"^#{1,2}\s*(.+)", section)
            heading = heading_match.group(1).strip() if heading_match else path.stem
            chunks.append(Chunk(source=path.name, heading=heading, text=section))

    return chunks


class Retriever:
    """Builds a TF-IDF matrix over the knowledge base once at startup and
    answers top-k similarity queries against it.
    """

    def __init__(self) -> None:
        self.chunks: List[Chunk] = _load_and_chunk_documents()
        self._doc_term_counts: List[Counter] = [Counter(_tokenize(c.text)) for c in self.chunks]
        self._vocab: List[str] = sorted({term for counts in self._doc_term_counts for term in counts})
        self._vocab_index = {term: i for i, term in enumerate(self._vocab)}
        self._idf = self._compute_idf()
        self._doc_vectors = (
            np.array([self._vectorize_counts(c) for c in self._doc_term_counts])
            if self.chunks else np.array([])
        )

    def _compute_idf(self) -> np.ndarray:
        n_docs = max(1, len(self._doc_term_counts))
        doc_freq = np.zeros(len(self._vocab))
        for counts in self._doc_term_counts:
            for term in counts:
                doc_freq[self._vocab_index[term]] += 1
        return np.log((1 + n_docs) / (1 + doc_freq)) + 1.0

    def _vectorize_counts(self, counts: Counter) -> np.ndarray:
        vec = np.zeros(len(self._vocab))
        total = sum(counts.values()) or 1
        for term, count in counts.items():
            idx = self._vocab_index.get(term)
            if idx is not None:
                vec[idx] = (count / total) * self._idf[idx]
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def query(self, question: str, top_k: int = 3, min_score: float = 0.05) -> List[Tuple[Chunk, float]]:
        """Return up to `top_k` (chunk, similarity_score) pairs for the
        given question, filtered to a minimum similarity so an unrelated
        question doesn't drag in irrelevant chunks just to fill top_k.
        """
        if not self.chunks:
            return []

        query_counts = Counter(_tokenize(question))
        query_vec = self._vectorize_counts(query_counts)

        if not np.any(query_vec):
            return []

        scores = self._doc_vectors @ query_vec
        ranked_indices = np.argsort(-scores)[:top_k]

        return [(self.chunks[i], float(scores[i])) for i in ranked_indices if scores[i] >= min_score]


_retriever = Retriever()


def retrieve_context(question: str, top_k: int = 3) -> str:
    """Retrieve the top-matching knowledge base chunks for `question` and
    format them as a single text block ready to inject into an LLM prompt.
    Returns an empty string if nothing matched well enough.
    """
    results = _retriever.query(question, top_k=top_k)
    if not results:
        return ""

    parts = [f"[Source: {chunk.source} — {chunk.heading}]\n{chunk.text}" for chunk, _ in results]
    return "\n\n---\n\n".join(parts)


if __name__ == "__main__":
    print(f"Loaded {len(_retriever.chunks)} chunks from {KNOWLEDGE_BASE_DIR}")
    for q in ["What is CAGR?", "Why was this instrument selected?", "What is PPF?"]:
        print(f"\n=== Query: {q} ===")
        print(retrieve_context(q))
