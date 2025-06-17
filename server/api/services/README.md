
# LLM Output Evaluator

This script evaluates the outputs of Large Language Models (LLMs) and estimates the associated token usage and cost.

It supports batch evalaution via a configuration CSV and produces a detailed metrics report in CSV format.

## Usage

This script evalutes LLM outputs using the `lighteval` library: https://huggingface.co/docs/lighteval/en/metric-list#automatic-metrics-for-generative-tasks

Ensure you have the `lighteval` library and any model SDKs (e.g., OpenAI, Anthropic) configured properly.


```bash
python evals.py --config path/to/config.csv --reference path/to/reference.csv --output path/to/results.csv
```

The arguments to the script are:

- Path to the config CSV file: Must include the columns "Model Name" and "Query"
- Path to the reference CSV file: Must include the columns "Context" and "Reference"
- Path where the evaluation resuls will be saved


The script outputs a CSV with the following columns:

* Evaluates LLM outputs for:

  * Extractiveness Coverage
  * Extractiveness Density
  * Extractiveness Compression

* Computes:

  * Token usage (input/output)
  * Estimated cost in USD
  * Duration (in seconds)
