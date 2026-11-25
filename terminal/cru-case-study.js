// Deck-supported project facts and owner-supplied AI outcomes are mapped in source-notes/cru/README.md.
window.cruCaseStudy = {
  title: 'CRU — AI-powered Transaction Processing',
  subtitle: 'Claims Records Unit · LexisNexis Risk Solutions',
  summary: 'Modernizing the exception-handling workspace behind police-report orders: combine AI-assisted processing with a clearer interface while preserving the keyboard-driven workflows experienced operators rely on.',
  role: 'Principal User Experience Designer II · Workflow mapping, interaction design and stakeholder collaboration',
  challenge: 'Insurance carriers request police reports through an automated routing process. Orders that cannot be processed automatically reach the Claims Records Unit, where operators investigate the exception, make a correction and route the request onward. A single correction can trigger additional workflows, including changes to agency records. The interface has to support that complexity at operational speed.',
  context: [
    ['7.6 million', 'orders processed in 2022'],
    ['About 30%', 'of requests required manual remediation'],
    ['3+ years', 'average operator tenure']
  ],
  people: 'CRU operators were experienced specialists with deeply embedded workflows. They navigated almost entirely through tabbing and keyboard shortcuts, and worked with little documentation of the legacy system. Familiarity was part of their efficiency, so a visual redesign could not casually disrupt their habits.',
  approach: 'Bring AI-assisted processing into a modernized operator experience, with the workflow itself as the starting point. Document the corrective-action paths, involve CRU operators directly, and preserve familiar navigation while improving the hierarchy of information and actions.',
  process: 'Workshops and collaborative mapping established the workflow. Adobe XD supported early design concepts; Axure supported the final mockups. Stakeholder feedback continued through the design process before the mockups were handed to engineering.',
  decisions: [
    {
      title: 'Preserve the keyboard path through the work',
      description: 'The redesign kept the familiar layout and keyboard functions as a foundation for the new experience. Common tasks remained directly accessible, and related information was organized into clearer groups.',
      why: 'Operators were already highly practiced. Retaining their navigation patterns let the design improve clarity without asking experienced users to relearn every interaction as AI-assisted processing was introduced.',
      tradeoff: 'Keeping familiar patterns limited how far the interface could be reorganized. The design prioritized continuity and efficient repeat use over a complete reimagining of the workflow.',
      image: 4
    },
    {
      title: 'Map the exceptions before simplifying the interface',
      description: 'The team documented workflows and sought input directly from CRU operators. The process map made visible the corrective actions and additional paths that a single order could trigger.',
      why: 'Much of the existing knowledge lived with the operators. Understanding those dependencies was essential to improving the experience without removing a step that another task relied on.',
      tradeoff: 'Mapping and stakeholder review added work before the final design. That investment addressed a larger risk: making a complex screen look simpler while leaving an exception path unsupported.',
      image: 0
    },
    {
      title: 'Support the way operators move between related tasks',
      description: 'The project accounted for single-window, tabbed and multi-window working environments, along with graceful window resizing. Related work, such as agency maintenance, had to fit into the same operational experience.',
      why: 'An exception may require a user to inspect an order and correct information elsewhere. Supporting these working arrangements preserves access to the context needed to complete the task.',
      tradeoff: 'Flexible working arrangements introduce more states and window sizes to handle. Consistent actions, field organization and navigation become more important as the interface spans multiple views.',
      image: 7
    },
    {
      title: 'Modernize the foundation alongside the experience',
      description: 'The design handoff supported a new React and TypeScript application, with Electron providing desktop packaging. The brief also called for modernization of the underlying infrastructure.',
      why: 'The experience depended on more than a visual refresh. A maintainable application foundation supported the redesign while retaining a desktop delivery model familiar to operators.',
      tradeoff: 'Rebuilding the legacy application required reverse engineering because technical documentation was limited. The team had to carry forward complex and conditional behavior while translating it into the new framework.',
      image: 5
    }
  ],
  impact: 'AI-assisted processing boosted overall productivity by 20%, resulting in a 10% increase in speed to cash.',
  takeaway: 'The case connects operational efficiency to business value: improve how exceptions are handled while preserving the interaction patterns that help experienced operators move through their work.'
};
