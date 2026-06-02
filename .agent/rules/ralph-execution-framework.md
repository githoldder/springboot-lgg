# Ralph Execution Framework

This project uses Ralph as the execution contract for AI-assisted work.

## Four Layers

```text
Object
  -> Key Result
    -> Task
      -> Step
```

## Local Rules

1. One step per execution pass. Do not mix unrelated fixes in one run.
2. Every step must name its verification command or observable result.
3. Demo stability has priority over architectural expansion.
4. Use PM2 for long-running local services. Do not use loose `nohup ... &` processes.
5. Do not introduce Docker or microservices unless the requirement explicitly changes.
6. Do not commit real secrets. Replace demo secrets with placeholders or environment variables.
7. Keep the old Vue2 project only as a migration source and fallback reference; the target admin surface is the RuoYi Vue3 frontend.

## Task Completion

A task is complete only when:

- the scoped files are changed,
- the relevant build or smoke check passes,
- residual risk is written down,
- and no unmanaged demo process is left running.
