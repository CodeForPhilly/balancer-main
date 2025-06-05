
# LLM Output Evaluator

This script evaluates the outputs of Large Language Models (LLMs) and estimates the associated token usage and cost.

It supports batch evalaution via a configuration CSV and produces a detailed metrics report in CSV format.

## Usage

Ensure you have the `lighteval` library and any model SDKs (e.g., OpenAI, Anthropic) configured properly.


```bash
python evals.py --config path/to/config.csv --reference path/to/reference.csv --output path/to/results.csv
```

The arguments to the script are:

- Path to the config CSV file (model, query, context)
- Path to the reference CSV file
- Path where the evaluation resulst will be saved


The script outputs a CSV with the following columns:

* Evaluates LLM outputs for:

  * Extractiveness Coverage
  * Extractiveness Density
  * Extractiveness Compression

* Computes:

  * Token usage (input/output)
  * Estimated cost in USD
  * Duration (in seconds)
