---
description: "{{DESCRIPTION}}"
---

# {{SKILL_DISPLAY_NAME}}

<objective>
{{DESCRIPTION}}

Data science skill for CSV/JSON processing, Python/Jupyter workflows, and data validation.
</objective>

<context>
- Skill: {{SKILL_NAME}}
- Domain: Data Science
- Created: {{DATE}}
</context>

<data-detection>
Detect the data context:
1. Check for data files (CSV, JSON, Parquet, Excel)
2. Check for Python environment (requirements.txt, pyproject.toml, Pipfile)
3. Check for Jupyter notebooks (.ipynb)
4. Check for data tools (pandas, numpy, scipy, scikit-learn)
5. Check for visualization libs (matplotlib, plotly, seaborn)
</data-detection>

<process>
1. Detect data environment and available tools
2. Parse `$ARGUMENTS` for the specific data task
3. Execute the data operation:
   - For exploration: read, describe, summarize data
   - For transformation: clean, merge, reshape data
   - For analysis: statistics, correlations, grouping
   - For validation: schema checks, missing values, outliers
4. Present results with appropriate formatting
5. Suggest next steps based on findings

For large datasets, always preview a sample first before full processing.
</process>

<best-practices>
- Preview data shape and types before processing
- Handle missing values explicitly
- Validate data types match expectations
- Use efficient operations for large datasets
- Document transformations applied
</best-practices>
