# Published release measurements

These are copies of the actual final slice 22 reports, not new measurements. The [run record](run.json) binds the exact production inventory and source. [Source](source.json), [affected acceptance run](affected-run.json) and [feedback measurements](affected-measurements.json) accompany it. Local absolute paths in JSON describe the original host.

Lighthouse 13.5.0 used installed Chrome 155.0.8059.39, mobile Slow 4G/4x CPU simulation and three cold navigations per route/language. All 24 runs passed; every CLS is zero. Protected routes retained a prepared identity/session. Public products started with empty storage; English was selected during the measured first navigation.

| Route fixture | Arabic raw reports | English raw reports |
| --- | --- | --- |
| Public products | [1](products-ar-1.json) · [2](products-ar-2.json) · [3](products-ar-3.json) | [1](products-en-1.json) · [2](products-en-2.json) · [3](products-en-3.json) |
| Applicant list | [1](applicant-ar-1.json) · [2](applicant-ar-2.json) · [3](applicant-ar-3.json) | [1](applicant-en-1.json) · [2](applicant-en-2.json) · [3](applicant-en-3.json) |
| Staff queue | [1](queue-ar-1.json) · [2](queue-ar-2.json) · [3](queue-ar-3.json) | [1](queue-en-1.json) · [2](queue-en-2.json) · [3](queue-en-3.json) |
| Staff review 007 | [1](review-ar-1.json) · [2](review-ar-2.json) · [3](review-ar-3.json) | [1](review-en-1.json) · [2](review-en-2.json) · [3](review-en-3.json) |

The delivery release retains the original HTML, traces, network logs and screenshots in `performance-evidence.zip`. See [the measured release narrative](../../../22-evidence.md#final-results) for medians, timing, machine conditions and the audited/rebuilt shell distinction.
