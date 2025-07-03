
# Evaluations

## LLM Output Evaluator

The `evals` script evaluates the outputs of Large Language Models (LLMs) and estimates the associated token usage and cost.

It supports batch evalaution via a configuration CSV and produces a detailed metrics report in CSV format.

### Usage

This script evaluates LLM outputs using the `lighteval` library:
https://huggingface.co/docs/lighteval/en/metric-list#automatic-metrics-for-generative-tasks

Ensure you have the `lighteval` library and any model SDKs (e.g., OpenAI) configured properly.


```bash
python evals.py --config path/to/config.csv --reference path/to/reference.csv --output path/to/results.csv
```

The arguments to the script are:

- Path to the config CSV file: Must include the columns "Model Name" and "Query"

```
import pandas as pd

# Define the data
data = [

    {
      "Model Name": "GPT_4O_MINI",
      "Query": """
      You're analyzing medical text from multiple sources. Each chunk is labeled [chunk-X].

      Act as a seasoned physician or medical professional who treats patients with bipolar disorder.

      Identify rules for medication inclusion or exclusion based on medical history or concerns.

      For each rule you find, return a JSON object using the following format:

      {
        "rule": "<condition or concern>",
        "type": "INCLUDE" or "EXCLUDE",
        "reason": "<short explanation for why this rule applies>",
        "medications": ["<medication 1>", "<medication 2>", ...],
        "source": "<chunk-X>"
      }

      Only include rules that are explicitly stated or strongly implied in the chunk.

      Only use the chunks provided. If no rule is found in a chunk, skip it.

      Return the entire output as a JSON array.
      """
    },

    {
        "Model Name": "GPT_41_NANO",
        "Query": """
        
    # Role and Objective
    
    - You are a seasoned physician or medical professional who is developing a bipolar disorder treatment algorithim

    - You are extracting bipolar medication decision points from a research paper that is chunked into multiple parts each labeled with an ID

    # Instructions

    - Identify decision points for bipolar medications

    - For each decision point you find, return a JSON object using the following format:

        {
            "criterion": "<condition or concern>",
            "decision": "INCLUDE" or "EXCLUDE",
            "medications": ["<medication 1>", "<medication 2>", ...],
            "reason": "<short explanation for why this criterion applies>",
            "sources": ["<ID-X>"]
        }


    - Only extract bipolar medication decision points that are explicitly stated or strongly implied in the context and never rely on your own knowledge

    # Output Format

    - Return the extracted bipolar medication decision points as a JSON array and if no decision points are found in the context return an empty array

    # Example

    [
        {
            "criterion": "History of suicide attempts",
            "decision": "INCLUDE",
            "medications": ["Lithium"],
            "reason": "Lithium is the only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder",
            "sources": ["ID-0"]
        },
        {
            "criterion": "Weight gain concerns",
            "decision": "EXCLUDE",
            "medications": ["Quetiapine", "Aripiprazole", "Olanzapine", "Risperidone"],
            "reason": "Seroquel, Risperdal, Abilify, and Zyprexa are known for causing weight gain",
            "sources": ["ID-0", "ID-1", "ID-2"]
        }
    ]

    """
        
    },
]

# Create DataFrame from records
df = pd.DataFrame.from_records(data)

# Write to CSV
df.to_csv("~/Desktop/evals_config.csv", index=False)
```


- Path to the reference CSV file: Must include the columns "Context" and "Reference"

```
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("postgresql+psycopg2://balancer:balancer@localhost:5433/balancer_dev")
# Filter out papers that shouldn't be used from local database
query = "SELECT * FROM api_embeddings WHERE date_of_upload > '2025-03-14';"
df = pd.read_sql(query, engine)

df['formatted_chunk'] = df.apply(lambda row: f"ID: {row['chunk_number']} | CONTENT: {row['text']}", axis=1)
# Ensure the chunks are joined in order of chunk_number by sorting the DataFrame before grouping and joining
df = df.sort_values(by=['name', 'upload_file_id', 'chunk_number'])
df_grouped = df.groupby(['name', 'upload_file_id'])['formatted_chunk'].apply(lambda chunks: "\n".join(chunks)).reset_index()
df_grouped = df_grouped.rename(columns={'formatted_chunk': 'concatenated_chunks'})
df_grouped.to_csv('~/Desktop/formatted_chunks.csv', index=False)
```

- Path where the evaluation resuls will be saved

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np


df = pd.read_csv("~/Desktop/evals_out-20250702.csv")

# Define the metrics of interest
extractiveness_cols = ['Extractiveness Coverage', 'Extractiveness Density', 'Extractiveness Compression']
token_cols = ['Input Token Usage', 'Output Token Usage']
other_metrics = ['Cost (USD)', 'Duration (s)']
all_metrics = extractiveness_cols + token_cols + other_metrics

# Metric histograms by model
plt.style.use('default')
fig, axes = plt.subplots(len(all_metrics), 1, figsize=(12, 4 * len(all_metrics)))

models = df['Model Name'].unique()
colors = plt.cm.Set3(np.linspace(0, 1, len(models)))

for i, metric in enumerate(all_metrics):
    ax = axes[i] if len(all_metrics) > 1 else axes
    
    # Create histogram for each model
    for j, model in enumerate(models):
        model_data = df[df['Model Name'] == model][metric]
        ax.hist(model_data, alpha=0.7, label=model, bins=min(8, len(model_data)), 
                color=colors[j], edgecolor='black', linewidth=0.5)
    
    ax.set_title(f'{metric} Distribution by Model', fontsize=14, fontweight='bold')
    ax.set_xlabel(metric, fontsize=12)
    ax.set_ylabel('Frequency', fontsize=12)
    ax.legend(title='Model', bbox_to_anchor=(1.05, 1), loc='upper left')
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

#TODO: Compute count, min, quantiles and max by model
#TODO: Calculate efficiency metrics: Totel Token Usage, Cost per Token, Tokens per Second, Cost per Second




The script outputs a CSV with the following columns:

* Evaluates LLM outputs for:

  * Extractiveness Coverage: Percentage of words in the summary that are part of an extractive fragment with the article
  * Extractiveness Density: Average length of the extractive fragement to which each word in the summary belongs
  * Extractiveness Compression: Word ratio between the article and the summary

* Computes:

  * Token usage (input/output)
  * Estimated cost in USD
  * Duration (in seconds)
