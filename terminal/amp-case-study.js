// Confirmed constraints supplied by the portfolio owner. See README.md for provenance.
window.ampCaseStudy = {
  summary: 'A shared administration experience for the internal Visualization Library Playground, connecting configuration, data, experimentation and review so teams can move from an idea to a usable proof of concept.',
  audience: 'Developers configure the environment, designers assess the visualization experience, and business and data analysts define the questions the output needs to answer. The interface needs to support those different levels of technical detail.',
  challenge: 'Producing visualization proofs of concept requires teams to bring together models, agents, data sources and evaluation. The management experience also has to expose complex rules and tracking without making every visit an investigation. The challenge was to make that work understandable while staying within enterprise security constraints.',
  approach: 'Keep the entry experience at a high level, with clear routes into configuration and detailed inspection. Scope the visualization layer to the library available within the security constraints, and preserve a path from the overview to the evidence behind it.',
  decisions: [
    {
      title: 'Adapt the visualization scope to the security constraint',
      description: 'The original visualization library choice became unavailable because of security restrictions. We scaled the implementation back to Chart.js and adjusted the visualization scope around that constraint.',
      why: 'The library decision had to support an implementation the team could move forward with. Chart.js became the practical foundation for the reduced scope, letting the work continue within the security boundary.',
      tradeoff: 'The compromise was a narrower visualization experience than originally planned. Core chart patterns took priority, while richer visualization ideas had to be deferred or reconsidered within the available library.',
      implication: 'The design needed to make the available chart patterns useful and consistent, with clear labeling and understandable comparisons. The library constraint became a scope decision, not just an engineering substitution.'
    },
    {
      title: 'Show the overview first, with a route into the detail',
      description: 'Complex rules and tracking created a tension between operational depth and a readable high-level view. The approach puts the overview first and gives users options to dive into the underlying detail.',
      why: 'Different visits require different levels of attention. A high-level view supports orientation; deliberate drill-down supports someone investigating a rule, an exception or the sequence behind a result.',
      tradeoff: 'Detail takes an extra step to reach, and a summary can hide an important exception if its signals are too weak. The overview needs clear status cues and obvious routes to the rules and tracking behind them.',
      implication: 'The summary and detail views should retain the same context. A user should be able to understand what needs attention, inspect the supporting information, and return without losing their place.'
    }
  ],
  screens: [
    ['workspaces', 'Workspaces', 'Choose the project context.'],
    ['environment', 'Environment', 'Inspect model, agent and visualization settings.'],
    ['data', 'Data sources', 'Check the inputs available to an experiment.'],
    ['experiments', 'Experiments', 'Run a defined visualization scenario.'],
    ['evaluation', 'Evaluation', 'Review the baseline and candidate.'],
    ['monitoring', 'Monitoring', 'Move from a high-level view into request details.']
  ]
};
