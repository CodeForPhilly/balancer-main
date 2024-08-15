from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)


class TransformerModel:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            logger.info("Loading SentenceTransformer model")
            cls._instance = super(TransformerModel, cls).__new__(cls)
            cls._instance.model = SentenceTransformer(
                'paraphrase-MiniLM-L6-v2')
        return cls._instance

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
