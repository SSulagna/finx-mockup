/* =========================================================================
 * FinX API Explorer — Curated Operation Overlay
 *
 * Keyed by  spec slug → path → method.  Each entry can override or augment
 * what comes out of the raw BIAN-derived OpenAPI spec:
 *
 *   {
 *     summary:        "...",           // overrides operation.summary
 *     description:    "markdown text", // overrides operation.description
 *     requestExample: {...},           // becomes requestBody.content.application/json.example
 *     responseExample:{ status: 200, body: {...} }, // becomes that response's example
 *     codeSamples: {
 *       curl:   "raw shell text",
 *       node:   "raw JS text",
 *       python: "raw python text"
 *     }
 *   }
 *
 * Hand-curated examples beat auto-generated schema samples every time.
 * Use realistic IDs (cust_..., agr_..., etc.), realistic timestamps,
 * realistic enum values. Match the response example to the request example.
 *
 * Endpoints without an overlay still get the auto-generated cURL / Node /
 * Python samples produced by `buildAutoSamples` in main.js, so coverage
 * degrades gracefully.
 * ========================================================================= */
(function () {
  var iso = function (offsetMs) {
    var d = new Date(Date.UTC(2026, 5, 1, 9, 30, 0) + (offsetMs || 0));
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
  };

  // -------------------------------------------------------------------------
  // Shared boilerplate, keeps individual entries readable.
  // -------------------------------------------------------------------------
  function curlBlock(method, path, opts) {
    opts = opts || {};
    var hasBody = !!opts.body;
    var hasIdem = !!opts.idempotent;
    var lines = [
      'curl --request ' + method + ' \\',
      '  --url https://gatewayqa.ustfinx.com' + path + ' \\',
      '  --header "Authorization: Bearer $FINX_TOKEN" \\',
      '  --header "X-Tenant-ID: $FINX_TENANT"'
    ];
    if (hasIdem) lines[lines.length - 1] += ' \\';
    if (hasIdem) lines.push('  --header "Idempotency-Key: ' + opts.idempotent + '"');
    if (hasBody) {
      lines[lines.length - 1] += ' \\';
      lines.push('  --header "Content-Type: application/json"' + ' \\');
      lines.push('  --data \'' + JSON.stringify(opts.body) + '\'');
    }
    return lines.join('\n');
  }

  function nodeBlock(method, path, opts) {
    opts = opts || {};
    var hasBody = !!opts.body;
    var lines = [
      "const res = await fetch('https://gatewayqa.ustfinx.com" + path + "', {",
      "  method: '" + method + "',",
      "  headers: {",
      "    Authorization: `Bearer ${process.env.FINX_TOKEN}`,",
      "    'X-Tenant-ID': process.env.FINX_TENANT" + (hasBody || opts.idempotent ? "," : ""),
      (opts.idempotent ? "    'Idempotency-Key': '" + opts.idempotent + "'" + (hasBody ? "," : "") : null),
      (hasBody ? "    'Content-Type': 'application/json'" : null),
      "  }" + (hasBody ? "," : ""),
      (hasBody ? "  body: JSON.stringify(" + JSON.stringify(opts.body, null, 2).replace(/\n/g, '\n  ') + ")" : null),
      "});",
      "",
      "if (!res.ok) throw new Error(`FinX ${res.status}: ${await res.text()}`);",
      "const data = await res.json();"
    ].filter(function (l) { return l !== null; });
    return lines.join('\n');
  }

  function pyBlock(method, path, opts) {
    opts = opts || {};
    var hasBody = !!opts.body;
    var lines = [
      "import os, requests",
      "",
      "headers = {",
      "    'Authorization': f\"Bearer {os.environ['FINX_TOKEN']}\",",
      "    'X-Tenant-ID':  os.environ['FINX_TENANT'],"
    ];
    if (opts.idempotent) lines.push("    'Idempotency-Key': '" + opts.idempotent + "',");
    if (hasBody) lines.push("    'Content-Type': 'application/json',");
    lines.push("}");
    lines.push("");
    if (hasBody) {
      var jsonStr = JSON.stringify(opts.body, null, 4);
      lines.push("payload = " + jsonStr);
      lines.push("");
      lines.push("resp = requests." + method.toLowerCase() + "(");
      lines.push("    'https://gatewayqa.ustfinx.com" + path + "',");
      lines.push("    headers=headers,");
      lines.push("    json=payload,");
      lines.push("    timeout=30,");
      lines.push(")");
    } else {
      lines.push("resp = requests." + method.toLowerCase() + "(");
      lines.push("    'https://gatewayqa.ustfinx.com" + path + "',");
      lines.push("    headers=headers,");
      lines.push("    timeout=30,");
      lines.push(")");
    }
    lines.push("resp.raise_for_status()");
    lines.push("data = resp.json()");
    return lines.join('\n');
  }

  // ---------- Realistic shared example bodies ---------------------------------
  var caEvaluateReq = {
    CustomerReference:        { customerId: 'cust_8KQ2vP7nR3xLmYzA' },
    LegalEntityReference:     { legalEntityId: 'le_finx_us_n01' },
    AgreementType:            'MasterServicesAgreement',
    AgreementJurisdiction:    { country: 'US', state: 'NY' },
    AgreementValidFromToDate: { from: '2026-06-01', to: '2031-05-31' },
    AgreementSignatoriesResponsibleParties: [
      { partyId: 'cust_8KQ2vP7nR3xLmYzA', role: 'AccountHolder' },
      { partyId: 'le_finx_us_n01',         role: 'ServiceProvider' }
    ],
    DocumentDirectoryEntryInstanceReference: { documentId: 'doc_msa_v3_2026' }
  };

  var caEvaluateResp = {
    CustomerAgreementInstanceReference: { customerAgreementId: 'agr_01HZQ8XK6PNR7M4F9Z3V' },
    CustomerAgreementInstanceStatus:    'Established',
    AgreementType:                      'MasterServicesAgreement',
    AgreementValidFromToDate:           { from: '2026-06-01', to: '2031-05-31' },
    AppliedRegulatoryTerms:             ['reg_us_glba_2026', 'reg_us_ccpa_2026'],
    AppliedPolicyTerms:                 ['pol_finx_aml_v7', 'pol_finx_kyc_v4'],
    AppliedLegalTerms:                  ['leg_msa_v3_2026'],
    CreatedAt:                          iso(0)
  };

  var caRetrieveResp = Object.assign({}, caEvaluateResp, {
    CustomerReference:    { customerId: 'cust_8KQ2vP7nR3xLmYzA' },
    LegalEntityReference: { legalEntityId: 'le_finx_us_n01' },
    AgreementSignatoriesResponsibleParties: caEvaluateReq.AgreementSignatoriesResponsibleParties,
    DocumentDirectoryEntryInstanceReference: { documentId: 'doc_msa_v3_2026', version: 3 },
    LastModifiedAt: iso(120000)
  });

  var caRegTermReq = {
    RegulatoryTermType:        'PrivacyDisclosure',
    RegulatoryFramework:       'US_GLBA',
    EffectiveDate:             '2026-06-01',
    DisclosureContentReference:{ documentId: 'doc_glba_privacy_v2' },
    CustomerAcknowledgementRequired: true
  };

  var caRegTermResp = {
    RegulatoryTermInstanceReference: { regulatoryTermId: 'reg_01HZQ8XKEVAL01' },
    RegulatoryTermType:              'PrivacyDisclosure',
    RegulatoryFramework:             'US_GLBA',
    Status:                          'Active',
    EffectiveDate:                   '2026-06-01',
    AppliedToCustomerAgreement:      'agr_01HZQ8XK6PNR7M4F9Z3V',
    CreatedAt:                       iso(60000)
  };

  // -------------------------------------------------------------------------
  // OVERLAY
  // -------------------------------------------------------------------------
  window.FINX_API_OVERLAY = {

    // =====================================================================
    // CUSTOMER AGREEMENT  (exemplar — fully curated)
    // =====================================================================
    'customer-agreement': {

      '/v1/customer-agreement/evaluate': {
        post: {
          summary: 'Establish a customer master agreement',
          description: [
            'Creates a new customer master agreement and runs FinX rule evaluation to attach the applicable regulatory, policy, and legal terms in a single call. This is the only endpoint that brings a brand-new agreement into existence; the per-term `evaluate` endpoints below are for adding additional terms to an agreement that already exists.',
            '',
            'The response contains the new `customerAgreementId` you will pass to every subsequent call (retrieve, update, grant, exchange). Persist it on your side keyed by your own customer record.',
            '',
            '**Idempotency.** Pass an `Idempotency-Key` header to guarantee at-most-once creation. A retry with the same key inside 24 hours returns the original agreement instead of creating a duplicate. See [Conventions → Idempotency](#/docs/glue/api-explorer/conventions).',
            '',
            '**Common use cases.** Account opening (link from the customer record); product application (called by Customer Offer when an offer converts); legal-entity migration (link a customer to a new servicing entity).'
          ].join('\n'),
          requestExample: caEvaluateReq,
          responseExample: { status: 200, body: caEvaluateResp },
          codeSamples: {
            curl:   curlBlock('POST', '/v1/customer-agreement/evaluate', { body: caEvaluateReq, idempotent: 'agr-2026-06-01-cust_8KQ2vP7nR3xLmYzA' }),
            node:   nodeBlock('POST', '/v1/customer-agreement/evaluate', { body: caEvaluateReq, idempotent: 'agr-2026-06-01-cust_8KQ2vP7nR3xLmYzA' }),
            python: pyBlock('POST',   '/v1/customer-agreement/evaluate', { body: caEvaluateReq, idempotent: 'agr-2026-06-01-cust_8KQ2vP7nR3xLmYzA' })
          }
        }
      },

      '/v1/customer-agreement/{customer-agreement-id}/update': {
        put: {
          summary: 'Update an existing customer master agreement',
          description: [
            'Updates the mutable header fields of an active customer master agreement (validity window, signatories, document references). The agreement type and customer reference are immutable; if either needs to change, create a new agreement with `evaluate` and supersede the old one with `control`.',
            '',
            'Updates do **not** re-evaluate the attached regulatory, policy, or legal terms. To refresh terms after a regulatory change, call the term-specific `evaluate` endpoints below.',
            '',
            'The full agreement state is returned in the response so you can sync your local cache without a follow-up retrieve.'
          ].join('\n'),
          requestExample: {
            AgreementValidFromToDate: { from: '2026-06-01', to: '2033-05-31' },
            AgreementSignatoriesResponsibleParties: [
              { partyId: 'cust_8KQ2vP7nR3xLmYzA', role: 'AccountHolder' },
              { partyId: 'cust_9NZ4tW2eRfX1bVgL', role: 'JointHolder' },
              { partyId: 'le_finx_us_n01',         role: 'ServiceProvider' }
            ]
          },
          responseExample: { status: 200, body: Object.assign({}, caRetrieveResp, {
            AgreementValidFromToDate: { from: '2026-06-01', to: '2033-05-31' },
            LastModifiedAt: iso(180000)
          })},
          codeSamples: {
            curl:   curlBlock('PUT', '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/update', { body: { AgreementValidFromToDate: { from: '2026-06-01', to: '2033-05-31' } } }),
            node:   nodeBlock('PUT', '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/update', { body: { AgreementValidFromToDate: { from: '2026-06-01', to: '2033-05-31' } } }),
            python: pyBlock('PUT',   '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/update', { body: { AgreementValidFromToDate: { from: '2026-06-01', to: '2033-05-31' } } })
          }
        }
      },

      '/v1/customer-agreement/{customer-agreement-id}/retrieve': {
        get: {
          summary: 'Retrieve a customer master agreement',
          description: [
            'Returns the current state of a customer master agreement, including the header fields and the IDs of every regulatory, policy, and legal term currently attached. Term IDs are returned as references; call the matching `/retrieve` endpoint per term type to expand them.',
            '',
            'This endpoint is cache-friendly. The response carries `LastModifiedAt`; you can avoid re-fetching by comparing it with the value you have stored. There is no `If-Modified-Since` header support yet.',
            '',
            '**404 vs 410.** A `404` means the agreement ID has never existed (likely a typo). A `410 Gone` means the agreement was superseded; the response body carries `SupersededBy` with the replacement agreement ID.'
          ].join('\n'),
          responseExample: { status: 200, body: caRetrieveResp },
          codeSamples: {
            curl:   curlBlock('GET', '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/retrieve', {}),
            node:   nodeBlock('GET', '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/retrieve', {}),
            python: pyBlock('GET',   '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/retrieve', {})
          }
        }
      },

      '/v1/customer-agreement/{customer-agreement-id}/regulatory-term/evaluate': {
        post: {
          summary: 'Attach a regulatory term to an existing agreement',
          description: [
            'Adds a new regulatory term to an agreement that already exists. Use this when a new regulation comes into force (for example a new state-level privacy law) and you need to attach the disclosure to every active agreement, rather than recreating each agreement from scratch.',
            '',
            'The framework value must be one of the registered regulatory frameworks for the agreement\'s jurisdiction. Calling `evaluate` for a framework that has already been attached returns the existing term ID without creating a duplicate.',
            '',
            '**Customer acknowledgement.** If `CustomerAcknowledgementRequired` is `true`, FinX Glass surfaces the disclosure for explicit acceptance the next time the customer signs in. The term remains in `PendingAcknowledgement` status until acceptance is recorded.'
          ].join('\n'),
          requestExample: caRegTermReq,
          responseExample: { status: 200, body: caRegTermResp },
          codeSamples: {
            curl:   curlBlock('POST', '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/regulatory-term/evaluate', { body: caRegTermReq, idempotent: 'reg-glba-cust_8KQ2vP7nR3xLmYzA-2026-06' }),
            node:   nodeBlock('POST', '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/regulatory-term/evaluate', { body: caRegTermReq, idempotent: 'reg-glba-cust_8KQ2vP7nR3xLmYzA-2026-06' }),
            python: pyBlock('POST',   '/v1/customer-agreement/agr_01HZQ8XK6PNR7M4F9Z3V/regulatory-term/evaluate', { body: caRegTermReq, idempotent: 'reg-glba-cust_8KQ2vP7nR3xLmYzA-2026-06' })
          }
        }
      },

      '/v1/customer-agreement/customer-information-profile/{customer-information-profile-id}/retrieve': {
        get: {
          summary: 'Look up an agreement by customer information profile',
          description: [
            'Convenience endpoint. Returns the active customer master agreement linked to a given Customer Information Profile (CIP) ID, without you having to look up the agreement ID first.',
            '',
            'Returns the same payload shape as the agreement-ID retrieve. If the customer has multiple agreements (for example one MSA and one product-specific agreement), only the master agreement is returned; use the agreement\'s `SalesProductAgreementReference` array to walk to the linked product agreements.',
            '',
            '`404` if no agreement is linked to the CIP. There is no implicit creation.'
          ].join('\n'),
          responseExample: { status: 200, body: caRetrieveResp },
          codeSamples: {
            curl:   curlBlock('GET', '/v1/customer-agreement/customer-information-profile/cip_8KQ2vP7nR3xLmYzA/retrieve', {}),
            node:   nodeBlock('GET', '/v1/customer-agreement/customer-information-profile/cip_8KQ2vP7nR3xLmYzA/retrieve', {}),
            python: pyBlock('GET',   '/v1/customer-agreement/customer-information-profile/cip_8KQ2vP7nR3xLmYzA/retrieve', {})
          }
        }
      }

    },

    // =====================================================================
    // PARTY LIFECYCLE MANAGEMENT  (spec slug: api-reference)
    // =====================================================================
    'api-reference': (function () {
      var plmInitReq = {
        PartyReference: { partyId: 'cust_8KQ2vP7nR3xLmYzA' },
        PartyType: 'IndividualConsumer',
        LifecycleState: 'Prospect',
        LifecycleStageReference: { stageId: 'stage_onboarding_v3' },
        ServicingJurisdiction: { country: 'US', state: 'NY' }
      };
      var plmInitResp = {
        PartyLifecycleManagementInstanceReference: { partyLifecycleId: 'plm_01HZQ9PLM00001' },
        PartyReference: plmInitReq.PartyReference,
        LifecycleState: 'Prospect',
        LifecycleSubstate: 'KycPending',
        CreatedAt: iso(0)
      };
      var plmQualReq = {
        PartyLifecycleManagementInstanceReference: { partyLifecycleId: 'plm_01HZQ9PLM00001' },
        QualificationType: 'KYC',
        QualificationFramework: 'US_FinCEN',
        EvidenceDocumentReferences: [{ documentId: 'doc_kyc_passport_v1' }, { documentId: 'doc_kyc_proofofaddr_v1' }]
      };
      var plmQualResp = {
        QualificationInstanceReference: { qualificationId: 'qual_01HZQ9PLMKYC01' },
        QualificationType: 'KYC',
        QualificationStatus: 'InReview',
        InitiatedAt: iso(30000)
      };
      var plmPrecReq = {
        PartyLifecycleManagementInstanceReference: { partyLifecycleId: 'plm_01HZQ9PLM00001' },
        PrecedentType: 'SanctionsScreening',
        PrecedentSource: 'ComplyAdvantage',
        ScreeningOutcome: 'Clear'
      };
      var plmPrecResp = {
        PrecedentInstanceReference: { precedentId: 'prec_01HZQ9PLMSAN01' },
        PrecedentType: 'SanctionsScreening',
        PrecedentStatus: 'Recorded',
        RecordedAt: iso(60000)
      };
      return {
        '/v1/party-lifecycle-management/initiate': {
          post: {
            summary: 'Open a party lifecycle record',
            description: [
              'Opens the umbrella lifecycle record for a party (individual or organisation). All subsequent qualification, precedent, and state-transition activity hangs off the returned `partyLifecycleId`.',
              '',
              'You typically call this once per customer at the very start of onboarding, before Customer Agreement, Party Reference Data, or any product-domain calls.',
              '',
              '**Idempotency.** Pass an `Idempotency-Key` derived from your internal customer ID. See [Conventions → Idempotency](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: plmInitReq,
            responseExample: { status: 200, body: plmInitResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/party-lifecycle-management/initiate', { body: plmInitReq, idempotent: 'plm-cust_8KQ2vP7nR3xLmYzA' }),
              node:   nodeBlock('POST', '/v1/party-lifecycle-management/initiate', { body: plmInitReq, idempotent: 'plm-cust_8KQ2vP7nR3xLmYzA' }),
              python: pyBlock('POST',   '/v1/party-lifecycle-management/initiate', { body: plmInitReq, idempotent: 'plm-cust_8KQ2vP7nR3xLmYzA' })
            }
          }
        },
        '/v1/party-lifecycle-management/{party-lifecycle-management-id}/qualification/initiate': {
          post: {
            summary: 'Start a qualification activity (KYC, AML, suitability)',
            description: [
              'Starts a discrete qualification activity against an open lifecycle record. The qualification is asynchronous: it returns immediately in `InReview` and transitions to `Cleared`, `Failed`, or `RequiresEscalation` based on the evaluating engine (FinX rule pack or a partner such as Jumio or ComplyAdvantage).',
              '',
              'Listen for `party.qualification.completed` events rather than polling the retrieve endpoint.'
            ].join('\n'),
            requestExample: plmQualReq,
            responseExample: { status: 200, body: plmQualResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/qualification/initiate', { body: plmQualReq }),
              node:   nodeBlock('POST', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/qualification/initiate', { body: plmQualReq }),
              python: pyBlock('POST',   '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/qualification/initiate', { body: plmQualReq })
            }
          }
        },
        '/v1/party-lifecycle-management/{party-lifecycle-management-id}/precedents/initiate': {
          post: {
            summary: 'Record a lifecycle precedent (screening result, prior decision)',
            description: [
              'Records a precedent against the lifecycle record. Precedents are immutable factual statements (a screening result, an adverse-media finding, a previously declined application) that are later evaluated by policy rules during state transitions.',
              '',
              'A `Recorded` precedent never disappears; if it turns out to be wrong, register a corrective precedent that supersedes it rather than mutating history.'
            ].join('\n'),
            requestExample: plmPrecReq,
            responseExample: { status: 200, body: plmPrecResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/precedents/initiate', { body: plmPrecReq }),
              node:   nodeBlock('POST', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/precedents/initiate', { body: plmPrecReq }),
              python: pyBlock('POST',   '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/precedents/initiate', { body: plmPrecReq })
            }
          }
        },
        '/v1/party-lifecycle-management/{party-lifecycle-management-id}/update': {
          put: {
            summary: 'Update the lifecycle state of a party',
            description: [
              'Drives the party to its next lifecycle state once qualifications and precedents allow it. Valid forward transitions: `Prospect → Onboarded → Active → Dormant → Closed`. Backward transitions are rejected; use a corrective lifecycle event instead.',
              '',
              'The transition is rule-evaluated server-side; a `409` response means the requested state is blocked by an outstanding qualification or precedent.'
            ].join('\n'),
            requestExample: { LifecycleState: 'Active', TransitionReason: 'AllQualificationsCleared' },
            responseExample: { status: 200, body: Object.assign({}, plmInitResp, { LifecycleState: 'Active', LifecycleSubstate: null, LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/update', { body: { LifecycleState: 'Active', TransitionReason: 'AllQualificationsCleared' } }),
              node:   nodeBlock('PUT', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/update', { body: { LifecycleState: 'Active', TransitionReason: 'AllQualificationsCleared' } }),
              python: pyBlock('PUT',   '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/update', { body: { LifecycleState: 'Active', TransitionReason: 'AllQualificationsCleared' } })
            }
          }
        },
        '/v1/party-lifecycle-management/{party-lifecycle-management-id}/qualification/{qualification-id}/retrieve': {
          get: {
            summary: 'Retrieve the current state of a qualification',
            description: 'Returns the latest state of a single qualification activity. Prefer event subscriptions over polling; this endpoint exists for reconciliation and for the Glass operator console.',
            responseExample: { status: 200, body: Object.assign({}, plmQualResp, { QualificationStatus: 'Cleared', ClearedAt: iso(240000), EvaluatedBy: 'finx_rule_kyc_v7' }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/qualification/qual_01HZQ9PLMKYC01/retrieve', {}),
              node:   nodeBlock('GET', '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/qualification/qual_01HZQ9PLMKYC01/retrieve', {}),
              python: pyBlock('GET',   '/v1/party-lifecycle-management/plm_01HZQ9PLM00001/qualification/qual_01HZQ9PLMKYC01/retrieve', {})
            }
          }
        }
      };
    })(),

    // =====================================================================
    // PARTY REFERENCE DATA DIRECTORY
    // =====================================================================
    'party-reference-data': (function () {
      var prdRegReq = {
        PartyType: 'IndividualConsumer',
        CorePartyProfile: {
          LegalName: { given: 'Aanya', family: 'Sharma' },
          DateOfBirth: '1989-04-12',
          PrimaryEmail: 'aanya.sharma@example.com',
          PrimaryPhone: '+1-212-555-0144',
          ResidentialAddress: { line1: '350 5th Ave', city: 'New York', state: 'NY', postalCode: '10118', country: 'US' },
          TaxIdentifiers: [{ scheme: 'US_SSN_LAST4', value: '4821' }]
        },
        SourcingChannel: 'WebOnboarding'
      };
      var prdRegResp = {
        PartyReferenceDataDirectoryInstanceReference: { partyDirectoryEntryId: 'prd_01HZQAPRD00001' },
        PartyReference: { partyId: 'cust_8KQ2vP7nR3xLmYzA' },
        PartyType: 'IndividualConsumer',
        DirectoryRecordStatus: 'Active',
        CreatedAt: iso(0)
      };
      var prdSearchReq = {
        SearchCriteria: { LegalName: { family: 'Sharma' }, ResidentialAddress: { country: 'US' } },
        PageSize: 25,
        Cursor: null
      };
      var prdSearchResp = {
        Results: [
          { partyDirectoryEntryId: 'prd_01HZQAPRD00001', partyId: 'cust_8KQ2vP7nR3xLmYzA', legalName: 'Aanya Sharma', matchScore: 0.97 },
          { partyDirectoryEntryId: 'prd_01HZQAPRD00042', partyId: 'cust_4FpL2nQ9zR3xVbCa', legalName: 'Arjun Sharma', matchScore: 0.71 }
        ],
        NextCursor: null,
        TotalEstimate: 2
      };
      return {
        '/v2/party-reference-data-directory/register': {
          post: {
            summary: 'Register a new party in the reference data directory',
            description: [
              'Registers a party (individual or organisation) as the source-of-truth reference record for that party across all downstream domains. The returned `partyId` is the canonical identifier that every other service domain consumes.',
              '',
              'Call this once per customer, after `party-lifecycle-management/initiate` and before Customer Agreement. Subsequent attribute changes go through `update`, never another `register`.',
              '',
              '**Idempotency** is required. See [Conventions → Idempotency](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: prdRegReq,
            responseExample: { status: 200, body: prdRegResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v2/party-reference-data-directory/register', { body: prdRegReq, idempotent: 'prd-aanya-sharma-2026-06-01' }),
              node:   nodeBlock('POST', '/v2/party-reference-data-directory/register', { body: prdRegReq, idempotent: 'prd-aanya-sharma-2026-06-01' }),
              python: pyBlock('POST',   '/v2/party-reference-data-directory/register', { body: prdRegReq, idempotent: 'prd-aanya-sharma-2026-06-01' })
            }
          }
        },
        '/v2/party-reference-data-directory/{party-reference-data-directory-id}/core-party-profile/register': {
          post: {
            summary: 'Attach or replace the core party profile',
            description: 'Attaches a versioned `CorePartyProfile` to an existing directory entry. Used when an organisation has multiple registered identities (e.g. trading name vs. legal name) and you need to add a parallel profile rather than overwrite the existing one with `update`.',
            requestExample: { CorePartyProfile: prdRegReq.CorePartyProfile, ProfileVariant: 'TradingName' },
            responseExample: { status: 200, body: { CorePartyProfileInstanceReference: { coreProfileId: 'cpp_01HZQAPRDCPP01' }, ProfileVariant: 'TradingName', Status: 'Active', CreatedAt: iso(60000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/v2/party-reference-data-directory/prd_01HZQAPRD00001/core-party-profile/register', { body: { CorePartyProfile: prdRegReq.CorePartyProfile, ProfileVariant: 'TradingName' } }),
              node:   nodeBlock('POST', '/v2/party-reference-data-directory/prd_01HZQAPRD00001/core-party-profile/register', { body: { CorePartyProfile: prdRegReq.CorePartyProfile, ProfileVariant: 'TradingName' } }),
              python: pyBlock('POST',   '/v2/party-reference-data-directory/prd_01HZQAPRD00001/core-party-profile/register', { body: { CorePartyProfile: prdRegReq.CorePartyProfile, ProfileVariant: 'TradingName' } })
            }
          }
        },
        '/v2/party-reference-data-directory/directory-record/execute': {
          post: {
            summary: 'Search the party directory',
            description: [
              'Runs a structured search against the directory. Supports fuzzy name matching, address normalisation, and tax-identifier hash lookup. Returns results sorted by `matchScore` descending.',
              '',
              '**Pagination.** Cursor-based. Pass back `NextCursor` verbatim on the next call; do not synthesise cursors. See [Conventions → Pagination](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: prdSearchReq,
            responseExample: { status: 200, body: prdSearchResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v2/party-reference-data-directory/directory-record/execute', { body: prdSearchReq }),
              node:   nodeBlock('POST', '/v2/party-reference-data-directory/directory-record/execute', { body: prdSearchReq }),
              python: pyBlock('POST',   '/v2/party-reference-data-directory/directory-record/execute', { body: prdSearchReq })
            }
          }
        },
        '/v2/party-reference-data-directory/{party-reference-data-directory-id}/retrieve': {
          get: {
            summary: 'Retrieve a single directory entry',
            description: 'Returns the full directory entry including all `CorePartyProfile` variants and the audit chain. This is a strongly consistent read; safe to use immediately after `register` or `update`.',
            responseExample: { status: 200, body: Object.assign({}, prdRegResp, { CorePartyProfile: prdRegReq.CorePartyProfile, LastModifiedAt: iso(120000) }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v2/party-reference-data-directory/prd_01HZQAPRD00001/retrieve', {}),
              node:   nodeBlock('GET', '/v2/party-reference-data-directory/prd_01HZQAPRD00001/retrieve', {}),
              python: pyBlock('GET',   '/v2/party-reference-data-directory/prd_01HZQAPRD00001/retrieve', {})
            }
          }
        },
        '/v2/party-reference-data-directory/{party-reference-data-directory-id}/update': {
          put: {
            summary: 'Update a directory entry',
            description: 'Patch-style update for the mutable fields of a directory entry (contact details, address, status). Immutable fields (`partyId`, `PartyType`, `DateOfBirth`) reject with `422`. Every successful update increments the entry version and emits `party.directory.updated`.',
            requestExample: { CorePartyProfile: { PrimaryPhone: '+1-212-555-0188', ResidentialAddress: prdRegReq.CorePartyProfile.ResidentialAddress } },
            responseExample: { status: 200, body: Object.assign({}, prdRegResp, { Version: 2, LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/v2/party-reference-data-directory/prd_01HZQAPRD00001/update', { body: { CorePartyProfile: { PrimaryPhone: '+1-212-555-0188' } } }),
              node:   nodeBlock('PUT', '/v2/party-reference-data-directory/prd_01HZQAPRD00001/update', { body: { CorePartyProfile: { PrimaryPhone: '+1-212-555-0188' } } }),
              python: pyBlock('PUT',   '/v2/party-reference-data-directory/prd_01HZQAPRD00001/update', { body: { CorePartyProfile: { PrimaryPhone: '+1-212-555-0188' } } })
            }
          }
        }
      };
    })(),

    // =====================================================================
    // CURRENT ACCOUNT
    // =====================================================================
    'current-account': (function () {
      var caInitReq = {
        CustomerReference: { customerId: 'cust_8KQ2vP7nR3xLmYzA' },
        ProductInstanceReference: { productId: 'prod_ca_everyday_usd_v2' },
        AccountCurrency: 'USD',
        AccountServicingBranch: { branchId: 'br_us_nyc_01' },
        InitialDepositAmount: { value: '250.00', currency: 'USD' }
      };
      var caInitResp = {
        CurrentAccountInstanceReference: { currentAccountId: 'acc_01HZQBCURRACC01' },
        AccountNumber: '4001-238-994-12',
        AccountStatus: 'Active',
        AvailableBalance: { value: '250.00', currency: 'USD' },
        LedgerBalance: { value: '250.00', currency: 'USD' },
        OpenedAt: iso(0)
      };
      return {
        '/v1/current-account/initiate': {
          post: {
            summary: 'Open a current account',
            description: [
              'Opens a new current account for an established customer against a configured product. The product instance encodes interest rules, fee schedule, overdraft policy, and statement frequency; you cannot override these at account level. To offer a different combination, register a new product variant rather than parameter-tweaking at `initiate`.',
              '',
              'The response includes both the FinX `currentAccountId` and the externally-presentable `AccountNumber`. Use the FinX ID in all subsequent API calls; use the account number on customer-facing artefacts only.',
              '',
              '**Idempotency.** Required. See [Conventions → Idempotency](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: caInitReq,
            responseExample: { status: 200, body: caInitResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/current-account/initiate', { body: caInitReq, idempotent: 'ca-cust_8KQ2vP7nR3xLmYzA-everyday-usd' }),
              node:   nodeBlock('POST', '/v1/current-account/initiate', { body: caInitReq, idempotent: 'ca-cust_8KQ2vP7nR3xLmYzA-everyday-usd' }),
              python: pyBlock('POST',   '/v1/current-account/initiate', { body: caInitReq, idempotent: 'ca-cust_8KQ2vP7nR3xLmYzA-everyday-usd' })
            }
          }
        },
        '/v1/current-account/{current-account-id}/retrieve': {
          get: {
            summary: 'Retrieve a current account',
            description: 'Returns the account header (status, balances, product reference, servicing branch). Balances are point-in-time as of request receipt; for transactional history use Position Keeping.',
            responseExample: { status: 200, body: Object.assign({}, caInitResp, { AvailableBalance: { value: '1842.55', currency: 'USD' }, LedgerBalance: { value: '1842.55', currency: 'USD' }, LastModifiedAt: iso(86400000) }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/current-account/acc_01HZQBCURRACC01/retrieve', {}),
              node:   nodeBlock('GET', '/v1/current-account/acc_01HZQBCURRACC01/retrieve', {}),
              python: pyBlock('GET',   '/v1/current-account/acc_01HZQBCURRACC01/retrieve', {})
            }
          }
        },
        '/v1/current-account/{current-account-id}/update': {
          put: {
            summary: 'Update mutable account attributes',
            description: 'Updates the mutable header fields (servicing branch, statement preferences, account alias). The product reference, currency, and account number are immutable; closing or migrating an account uses dedicated endpoints rather than `update`.',
            requestExample: { AccountServicingBranch: { branchId: 'br_us_nyc_02' }, AccountAlias: 'Everyday checking' },
            responseExample: { status: 200, body: Object.assign({}, caInitResp, { AccountServicingBranch: { branchId: 'br_us_nyc_02' }, AccountAlias: 'Everyday checking', LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/v1/current-account/acc_01HZQBCURRACC01/update', { body: { AccountAlias: 'Everyday checking' } }),
              node:   nodeBlock('PUT', '/v1/current-account/acc_01HZQBCURRACC01/update', { body: { AccountAlias: 'Everyday checking' } }),
              python: pyBlock('PUT',   '/v1/current-account/acc_01HZQBCURRACC01/update', { body: { AccountAlias: 'Everyday checking' } })
            }
          }
        },
        '/stub/current-account/{current-account-id}/deposit/initiate': {
          post: {
            summary: 'Initiate a deposit into the account',
            description: 'Initiates a deposit (cash, cheque, or inbound transfer) against the account. Returns immediately with `Pending`; the position is updated asynchronously when the underlying movement clears. Listen for `account.transaction.posted` rather than polling.',
            requestExample: { DepositAmount: { value: '500.00', currency: 'USD' }, DepositChannel: 'InboundACH', ExternalReference: 'ach-2026-06-01-9931' },
            responseExample: { status: 200, body: { DepositInstanceReference: { depositId: 'dep_01HZQBCURRDEP01' }, Status: 'Pending', ExpectedSettlementDate: '2026-06-02', InitiatedAt: iso(60000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/current-account/acc_01HZQBCURRACC01/deposit/initiate', { body: { DepositAmount: { value: '500.00', currency: 'USD' }, DepositChannel: 'InboundACH' }, idempotent: 'dep-ach-2026-06-01-9931' }),
              node:   nodeBlock('POST', '/stub/current-account/acc_01HZQBCURRACC01/deposit/initiate', { body: { DepositAmount: { value: '500.00', currency: 'USD' }, DepositChannel: 'InboundACH' }, idempotent: 'dep-ach-2026-06-01-9931' }),
              python: pyBlock('POST',   '/stub/current-account/acc_01HZQBCURRACC01/deposit/initiate', { body: { DepositAmount: { value: '500.00', currency: 'USD' }, DepositChannel: 'InboundACH' }, idempotent: 'dep-ach-2026-06-01-9931' })
            }
          }
        },
        '/stub/current-account/{current-account-id}/debit-and-credit/{debit-and-credit-id}/execute': {
          put: {
            summary: 'Execute a debit-and-credit posting',
            description: 'Posts the matched debit-and-credit pair into the account ledger. This is the synchronous settlement endpoint; once it returns `200`, the funds are reflected in `LedgerBalance` and `AvailableBalance`. A `409` means the posting has already been executed; treat it as success.',
            requestExample: { PostingAmount: { value: '125.40', currency: 'USD' }, Direction: 'Debit', CounterpartyReference: 'cp_merchant_acme_01', ValueDate: '2026-06-01' },
            responseExample: { status: 200, body: { DebitAndCreditInstanceReference: { debitAndCreditId: 'dac_01HZQBCURRDAC01' }, Status: 'Posted', PostedBalance: { value: '1717.15', currency: 'USD' }, PostedAt: iso(120000) } },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/current-account/acc_01HZQBCURRACC01/debit-and-credit/dac_01HZQBCURRDAC01/execute', { body: { PostingAmount: { value: '125.40', currency: 'USD' }, Direction: 'Debit' } }),
              node:   nodeBlock('PUT', '/stub/current-account/acc_01HZQBCURRACC01/debit-and-credit/dac_01HZQBCURRDAC01/execute', { body: { PostingAmount: { value: '125.40', currency: 'USD' }, Direction: 'Debit' } }),
              python: pyBlock('PUT',   '/stub/current-account/acc_01HZQBCURRACC01/debit-and-credit/dac_01HZQBCURRDAC01/execute', { body: { PostingAmount: { value: '125.40', currency: 'USD' }, Direction: 'Debit' } })
            }
          }
        }
      };
    })(),

    // =====================================================================
    // SAVINGS ACCOUNT
    // =====================================================================
    'savings-account': (function () {
      var saInitReq = {
        CustomerReference: { customerId: 'cust_8KQ2vP7nR3xLmYzA' },
        ProductInstanceReference: { productId: 'prod_sa_highyield_usd_v1' },
        AccountCurrency: 'USD',
        LinkedFundingAccount: { currentAccountId: 'acc_01HZQBCURRACC01' },
        InitialDepositAmount: { value: '5000.00', currency: 'USD' }
      };
      var saInitResp = {
        SavingsAccountInstanceReference: { savingsAccountId: 'sav_01HZQCSAVACC01' },
        AccountNumber: '4002-771-118-44',
        AccountStatus: 'Active',
        AvailableBalance: { value: '5000.00', currency: 'USD' },
        InterestRate: { annualEquivalent: '4.25', basis: 'ACT/365' },
        OpenedAt: iso(0)
      };
      return {
        '/v1/savings-account/initiate': {
          post: {
            summary: 'Open a savings account',
            description: [
              'Opens a savings account for an established customer. Interest rate, accrual basis, and tier rules are inherited from the product; do not pass them on the request.',
              '',
              'If `LinkedFundingAccount` is provided, the initial deposit is debited from that account in the same logical transaction. If it is omitted, the account is opened with a zero balance and the customer must fund it through a deposit call.',
              '',
              '**Idempotency.** Required. See [Conventions → Idempotency](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: saInitReq,
            responseExample: { status: 200, body: saInitResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/savings-account/initiate', { body: saInitReq, idempotent: 'sa-cust_8KQ2vP7nR3xLmYzA-highyield' }),
              node:   nodeBlock('POST', '/v1/savings-account/initiate', { body: saInitReq, idempotent: 'sa-cust_8KQ2vP7nR3xLmYzA-highyield' }),
              python: pyBlock('POST',   '/v1/savings-account/initiate', { body: saInitReq, idempotent: 'sa-cust_8KQ2vP7nR3xLmYzA-highyield' })
            }
          }
        },
        '/v1/savings-account/{savings-account-id}/retrieve': {
          get: {
            summary: 'Retrieve a savings account',
            description: 'Returns the account header, balances, current interest rate, and any active sweep configuration. Strongly consistent.',
            responseExample: { status: 200, body: Object.assign({}, saInitResp, { AvailableBalance: { value: '5217.42', currency: 'USD' }, AccruedInterestUnposted: { value: '17.42', currency: 'USD' }, LastModifiedAt: iso(2592000000) }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/savings-account/sav_01HZQCSAVACC01/retrieve', {}),
              node:   nodeBlock('GET', '/v1/savings-account/sav_01HZQCSAVACC01/retrieve', {}),
              python: pyBlock('GET',   '/v1/savings-account/sav_01HZQCSAVACC01/retrieve', {})
            }
          }
        },
        '/stub/savings-account/{savings-account-id}/deposit/initiate': {
          post: {
            summary: 'Initiate a deposit into a savings account',
            description: 'Initiates a deposit against a savings account. Same async semantics as the current-account deposit endpoint; settled funds become eligible for interest accrual the day they post.',
            requestExample: { DepositAmount: { value: '1000.00', currency: 'USD' }, DepositChannel: 'InternalTransfer', SourceAccount: { currentAccountId: 'acc_01HZQBCURRACC01' } },
            responseExample: { status: 200, body: { DepositInstanceReference: { depositId: 'dep_01HZQCSAVDEP01' }, Status: 'Posted', PostedAt: iso(30000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/savings-account/sav_01HZQCSAVACC01/deposit/initiate', { body: { DepositAmount: { value: '1000.00', currency: 'USD' }, DepositChannel: 'InternalTransfer' }, idempotent: 'sav-dep-2026-06-01-001' }),
              node:   nodeBlock('POST', '/stub/savings-account/sav_01HZQCSAVACC01/deposit/initiate', { body: { DepositAmount: { value: '1000.00', currency: 'USD' }, DepositChannel: 'InternalTransfer' }, idempotent: 'sav-dep-2026-06-01-001' }),
              python: pyBlock('POST',   '/stub/savings-account/sav_01HZQCSAVACC01/deposit/initiate', { body: { DepositAmount: { value: '1000.00', currency: 'USD' }, DepositChannel: 'InternalTransfer' }, idempotent: 'sav-dep-2026-06-01-001' })
            }
          }
        },
        '/stub/savings-account/{savings-account-id}/interest/{interest-id}/execute': {
          put: {
            summary: 'Execute an interest posting',
            description: 'Posts an accrued interest amount to the account. Normally invoked by the FinX interest scheduler on the product\'s configured posting frequency; manual invocation is reserved for ops-led corrections.',
            requestExample: { InterestAmount: { value: '17.42', currency: 'USD' }, AccrualPeriod: { from: '2026-05-01', to: '2026-05-31' }, PostingType: 'Scheduled' },
            responseExample: { status: 200, body: { InterestInstanceReference: { interestId: 'int_01HZQCSAVINT01' }, Status: 'Posted', PostedBalance: { value: '5217.42', currency: 'USD' }, PostedAt: iso(120000) } },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/savings-account/sav_01HZQCSAVACC01/interest/int_01HZQCSAVINT01/execute', { body: { InterestAmount: { value: '17.42', currency: 'USD' }, PostingType: 'Scheduled' } }),
              node:   nodeBlock('PUT', '/stub/savings-account/sav_01HZQCSAVACC01/interest/int_01HZQCSAVINT01/execute', { body: { InterestAmount: { value: '17.42', currency: 'USD' }, PostingType: 'Scheduled' } }),
              python: pyBlock('PUT',   '/stub/savings-account/sav_01HZQCSAVACC01/interest/int_01HZQCSAVINT01/execute', { body: { InterestAmount: { value: '17.42', currency: 'USD' }, PostingType: 'Scheduled' } })
            }
          }
        },
        '/stub/savings-account/{savings-account-id}/sweep/initiate': {
          post: {
            summary: 'Configure an automated sweep',
            description: 'Configures an automated sweep between this savings account and a linked current account. Sweep can be balance-trigger (sweep excess above threshold) or schedule-trigger (sweep on the 1st of every month). Replaces any existing sweep on the account; there is at most one active sweep per savings account.',
            requestExample: { SweepType: 'BalanceThreshold', Threshold: { value: '10000.00', currency: 'USD' }, TargetAccount: { currentAccountId: 'acc_01HZQBCURRACC01' }, Direction: 'SavingsToCurrent' },
            responseExample: { status: 200, body: { SweepInstanceReference: { sweepId: 'swp_01HZQCSAVSWP01' }, Status: 'Active', NextEvaluationAt: iso(86400000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/savings-account/sav_01HZQCSAVACC01/sweep/initiate', { body: { SweepType: 'BalanceThreshold', Threshold: { value: '10000.00', currency: 'USD' } } }),
              node:   nodeBlock('POST', '/stub/savings-account/sav_01HZQCSAVACC01/sweep/initiate', { body: { SweepType: 'BalanceThreshold', Threshold: { value: '10000.00', currency: 'USD' } } }),
              python: pyBlock('POST',   '/stub/savings-account/sav_01HZQCSAVACC01/sweep/initiate', { body: { SweepType: 'BalanceThreshold', Threshold: { value: '10000.00', currency: 'USD' } } })
            }
          }
        }
      };
    })(),

    // =====================================================================
    // PAYMENT ORDER INITIATION
    // =====================================================================
    'payment-order-initiation': (function () {
      var poInitReq = {
        DebitAccount: { currentAccountId: 'acc_01HZQBCURRACC01' },
        CreditCounterparty: {
          AccountIdentifier: { scheme: 'IBAN', value: 'GB29NWBK60161331926819' },
          BeneficiaryName: 'Northwind Trading Ltd',
          BankIdentifier: { scheme: 'BIC', value: 'NWBKGB2L' }
        },
        PaymentAmount: { value: '1450.00', currency: 'GBP' },
        PaymentScheme: 'SWIFT',
        ValueDate: '2026-06-03',
        EndToEndReference: 'INV-2026-04412',
        RemittanceInformation: 'Invoice 2026-04412, May services'
      };
      var poInitResp = {
        PaymentOrderInstanceReference: { paymentOrderId: 'pay_01HZQDPAYORD01' },
        Status: 'Accepted',
        Stage: 'AwaitingExecution',
        ExpectedSettlementDate: '2026-06-03',
        AcceptedAt: iso(0)
      };
      return {
        '/stub/payment-order-initiation/initiate': {
          post: {
            summary: 'Initiate a payment order',
            description: [
              'Initiates an outgoing payment order. The order is validated synchronously (account ownership, scheme reachability, sanctions screening) and accepted into the execution queue. Returns `Accepted` immediately; the actual scheme submission and settlement happen asynchronously.',
              '',
              'Subscribe to `payment.order.executed` and `payment.order.settled` rather than polling the retrieve endpoint.',
              '',
              '**Idempotency is mandatory.** A duplicated payment is a real-money incident. Use a deterministic key such as your internal invoice ID. See [Conventions → Idempotency](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: poInitReq,
            responseExample: { status: 200, body: poInitResp },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/payment-order-initiation/initiate', { body: poInitReq, idempotent: 'pay-INV-2026-04412' }),
              node:   nodeBlock('POST', '/stub/payment-order-initiation/initiate', { body: poInitReq, idempotent: 'pay-INV-2026-04412' }),
              python: pyBlock('POST',   '/stub/payment-order-initiation/initiate', { body: poInitReq, idempotent: 'pay-INV-2026-04412' })
            }
          }
        },
        '/stub/payment-order-initiation/{payment-order-initiation-id}/update': {
          put: {
            summary: 'Update a payment order before execution',
            description: 'Updates a payment order that is still in `Accepted` / `AwaitingExecution`. Only `ValueDate` and `RemittanceInformation` are mutable; the amount and counterparty are immutable once accepted. Returns `409` if the order has already executed.',
            requestExample: { ValueDate: '2026-06-04', RemittanceInformation: 'Invoice 2026-04412 (rescheduled)' },
            responseExample: { status: 200, body: Object.assign({}, poInitResp, { ExpectedSettlementDate: '2026-06-04', LastModifiedAt: iso(120000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/update', { body: { ValueDate: '2026-06-04' } }),
              node:   nodeBlock('PUT', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/update', { body: { ValueDate: '2026-06-04' } }),
              python: pyBlock('PUT',   '/stub/payment-order-initiation/pay_01HZQDPAYORD01/update', { body: { ValueDate: '2026-06-04' } })
            }
          }
        },
        '/stub/payment-order-initiation/{payment-order-initiation-id}/order-initiation/{order-initiation-id}/exchange': {
          put: {
            summary: 'Exchange the order with the scheme adapter',
            description: 'Hands the validated payment off to the scheme adapter (SWIFT, FedNow, SEPA, etc.). Normally invoked by the FinX execution scheduler; manual invocation is reserved for replays after an adapter outage.',
            requestExample: { Action: 'Submit', SchemeReference: 'SWIFT_MT103' },
            responseExample: { status: 200, body: { OrderInitiationInstanceReference: { orderInitiationId: 'ord_01HZQDPAYEXC01' }, Status: 'Submitted', SchemeMessageId: 'mt103-20260603-1145-99821', SubmittedAt: iso(180000) } },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/order-initiation/ord_01HZQDPAYEXC01/exchange', { body: { Action: 'Submit' } }),
              node:   nodeBlock('PUT', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/order-initiation/ord_01HZQDPAYEXC01/exchange', { body: { Action: 'Submit' } }),
              python: pyBlock('PUT',   '/stub/payment-order-initiation/pay_01HZQDPAYORD01/order-initiation/ord_01HZQDPAYEXC01/exchange', { body: { Action: 'Submit' } })
            }
          }
        },
        '/stub/payment-order-initiation/{payment-order-initiation-id}/retrieve': {
          get: {
            summary: 'Retrieve the current state of a payment order',
            description: 'Returns the full lifecycle of a payment order: acceptance, validation, scheme submission, settlement, and any cancellation or recall. Use this for the operator console; subscribe to events for system-to-system flows.',
            responseExample: { status: 200, body: Object.assign({}, poInitResp, { Stage: 'Settled', SettledAt: iso(259200000), SchemeReference: 'SWIFT_MT103', SchemeMessageId: 'mt103-20260603-1145-99821' }) },
            codeSamples: {
              curl:   curlBlock('GET', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/retrieve', {}),
              node:   nodeBlock('GET', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/retrieve', {}),
              python: pyBlock('GET',   '/stub/payment-order-initiation/pay_01HZQDPAYORD01/retrieve', {})
            }
          }
        },
        '/stub/payment-order-initiation/{payment-order-initiation-id}/confirmation/{confirmation-id}/retrieve': {
          get: {
            summary: 'Retrieve a scheme settlement confirmation',
            description: 'Returns the scheme-level confirmation artefact for a settled payment (e.g. SWIFT MT900, FedNow acknowledgement). Use this when reconciling against the bank\'s nostro statements or generating customer-facing settlement receipts.',
            responseExample: { status: 200, body: { ConfirmationInstanceReference: { confirmationId: 'conf_01HZQDPAYCNF01' }, ConfirmationType: 'SchemeSettlement', SchemeMessageType: 'MT900', SchemeReference: 'SWIFT_MT900', SettledAmount: { value: '1450.00', currency: 'GBP' }, ReceivedAt: iso(259200000) } },
            codeSamples: {
              curl:   curlBlock('GET', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/confirmation/conf_01HZQDPAYCNF01/retrieve', {}),
              node:   nodeBlock('GET', '/stub/payment-order-initiation/pay_01HZQDPAYORD01/confirmation/conf_01HZQDPAYCNF01/retrieve', {}),
              python: pyBlock('GET',   '/stub/payment-order-initiation/pay_01HZQDPAYORD01/confirmation/conf_01HZQDPAYCNF01/retrieve', {})
            }
          }
        }
      };
    })(),

    // =====================================================================
    // POSITION KEEPING
    // =====================================================================
    'position-keeping': (function () {
      var pkInitReq = {
        PositionAccountReference: { positionAccountId: 'pos_acc_01HZQEPOSACC01' },
        AssetClass: 'Cash',
        Currency: 'USD',
        SourceAccount: { currentAccountId: 'acc_01HZQBCURRACC01' }
      };
      var pkInitResp = {
        PositionKeepingInstanceReference: { positionKeepingId: 'pk_01HZQEPOSKEEP01' },
        PositionAccountReference: pkInitReq.PositionAccountReference,
        OpeningBalance: { value: '0.00', currency: 'USD' },
        CurrentBalance: { value: '0.00', currency: 'USD' },
        Status: 'Open',
        OpenedAt: iso(0)
      };
      return {
        '/stub/position-keeping/initiate': {
          post: {
            summary: 'Open a position-keeping book',
            description: [
              'Opens a position-keeping book against an account. One position-keeping instance manages the running ledger for one (account, asset-class, currency) tuple. Multi-currency accounts require one position book per currency.',
              '',
              'Position books are an implementation surface and are usually opened by the platform itself during account creation, not by client code.'
            ].join('\n'),
            requestExample: pkInitReq,
            responseExample: { status: 200, body: pkInitResp },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/position-keeping/initiate', { body: pkInitReq, idempotent: 'pk-acc_01HZQBCURRACC01-USD' }),
              node:   nodeBlock('POST', '/stub/position-keeping/initiate', { body: pkInitReq, idempotent: 'pk-acc_01HZQBCURRACC01-USD' }),
              python: pyBlock('POST',   '/stub/position-keeping/initiate', { body: pkInitReq, idempotent: 'pk-acc_01HZQBCURRACC01-USD' })
            }
          }
        },
        '/stub/position-keeping/{position-keeping-id}/financial-transaction-capture/{financial-transaction-capture-id}/capture': {
          put: {
            summary: 'Capture a financial transaction into the position',
            description: 'Captures a single financial transaction (debit or credit) into the position book. This is the canonical ledger write; all other balance-impacting endpoints (deposit, debit-and-credit execute, interest execute, payment settlement) ultimately call this.',
            requestExample: { Direction: 'Credit', Amount: { value: '500.00', currency: 'USD' }, ValueDate: '2026-06-02', SourceEventReference: 'dep_01HZQBCURRDEP01', NarrativeText: 'Inbound ACH credit' },
            responseExample: { status: 200, body: { FinancialTransactionCaptureInstanceReference: { financialTransactionCaptureId: 'ftc_01HZQEPOSFTC01' }, Status: 'Captured', RunningBalance: { value: '500.00', currency: 'USD' }, CapturedAt: iso(60000) } },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/position-keeping/pk_01HZQEPOSKEEP01/financial-transaction-capture/ftc_01HZQEPOSFTC01/capture', { body: { Direction: 'Credit', Amount: { value: '500.00', currency: 'USD' } } }),
              node:   nodeBlock('PUT', '/stub/position-keeping/pk_01HZQEPOSKEEP01/financial-transaction-capture/ftc_01HZQEPOSFTC01/capture', { body: { Direction: 'Credit', Amount: { value: '500.00', currency: 'USD' } } }),
              python: pyBlock('PUT',   '/stub/position-keeping/pk_01HZQEPOSKEEP01/financial-transaction-capture/ftc_01HZQEPOSFTC01/capture', { body: { Direction: 'Credit', Amount: { value: '500.00', currency: 'USD' } } })
            }
          }
        },
        '/v1/position-keeping/{position-keeping-id}/financial-transaction-capture/{financial-transaction-capture-id}/retrieve': {
          get: {
            summary: 'Retrieve a single captured transaction',
            description: 'Returns a single captured transaction with full audit data (source event reference, narrative, value date, running balance at capture time). Use for transaction-detail screens and dispute investigation.',
            responseExample: { status: 200, body: { FinancialTransactionCaptureInstanceReference: { financialTransactionCaptureId: 'ftc_01HZQEPOSFTC01' }, Direction: 'Credit', Amount: { value: '500.00', currency: 'USD' }, RunningBalance: { value: '500.00', currency: 'USD' }, ValueDate: '2026-06-02', NarrativeText: 'Inbound ACH credit', CapturedAt: iso(60000), SourceEventReference: 'dep_01HZQBCURRDEP01' } },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/position-keeping/pk_01HZQEPOSKEEP01/financial-transaction-capture/ftc_01HZQEPOSFTC01/retrieve', {}),
              node:   nodeBlock('GET', '/v1/position-keeping/pk_01HZQEPOSKEEP01/financial-transaction-capture/ftc_01HZQEPOSFTC01/retrieve', {}),
              python: pyBlock('GET',   '/v1/position-keeping/pk_01HZQEPOSKEEP01/financial-transaction-capture/ftc_01HZQEPOSFTC01/retrieve', {})
            }
          }
        },
        '/stub/position-keeping/{position-keeping-id}/retrieve': {
          get: {
            summary: 'Retrieve a position book header',
            description: 'Returns the current state of a position book: opening balance, current balance, status, last-captured transaction reference. For paged transaction history, use the financial-transaction-capture collection endpoint (not curated here).',
            responseExample: { status: 200, body: Object.assign({}, pkInitResp, { CurrentBalance: { value: '1842.55', currency: 'USD' }, LastTransactionReference: 'ftc_01HZQEPOSFTC42', LastModifiedAt: iso(86400000) }) },
            codeSamples: {
              curl:   curlBlock('GET', '/stub/position-keeping/pk_01HZQEPOSKEEP01/retrieve', {}),
              node:   nodeBlock('GET', '/stub/position-keeping/pk_01HZQEPOSKEEP01/retrieve', {}),
              python: pyBlock('GET',   '/stub/position-keeping/pk_01HZQEPOSKEEP01/retrieve', {})
            }
          }
        },
        '/stub/position-keeping/{position-keeping-id}/control': {
          put: {
            summary: 'Apply a control action to a position book',
            description: 'Applies an administrative control action: `Freeze` (block all captures), `Unfreeze`, `Close` (terminal), `ForceReconcile` (re-walk all captures and rewrite the running balance). Reserved for ops; do not invoke from customer-facing code.',
            requestExample: { ControlAction: 'Freeze', Reason: 'PendingDisputeInvestigation', AuthorisedBy: 'op_supervisor_42' },
            responseExample: { status: 200, body: Object.assign({}, pkInitResp, { Status: 'Frozen', LastControlAction: 'Freeze', LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/position-keeping/pk_01HZQEPOSKEEP01/control', { body: { ControlAction: 'Freeze', Reason: 'PendingDisputeInvestigation' } }),
              node:   nodeBlock('PUT', '/stub/position-keeping/pk_01HZQEPOSKEEP01/control', { body: { ControlAction: 'Freeze', Reason: 'PendingDisputeInvestigation' } }),
              python: pyBlock('PUT',   '/stub/position-keeping/pk_01HZQEPOSKEEP01/control', { body: { ControlAction: 'Freeze', Reason: 'PendingDisputeInvestigation' } })
            }
          }
        }
      };
    })(),

    // =====================================================================
    // PRODUCT DIRECTORY
    // =====================================================================
    'product-directory': (function () {
      var pdRegReq = {
        ProductType: 'CurrentAccount',
        ProductName: 'Everyday Checking USD',
        ProductCode: 'CA-EVERYDAY-USD-V2',
        ProductFamily: 'RetailDeposits',
        BaseCurrency: 'USD',
        ProductDescription: 'No-fee everyday checking account, USD only, US residents.',
        ProductFeatures: ['DebitCard', 'OnlineBillPay', 'OverdraftOptIn']
      };
      var pdRegResp = {
        ProductDirectoryInstanceReference: { productId: 'prod_ca_everyday_usd_v2' },
        ProductCode: 'CA-EVERYDAY-USD-V2',
        Status: 'Active',
        Version: 2,
        RegisteredAt: iso(0)
      };
      return {
        '/stub/product-directory/register': {
          post: {
            summary: 'Register a product in the directory',
            description: [
              'Registers a new product (deposit, loan, payment product, etc.) in the central directory. The returned `productId` is what every product-instance call (open account, issue card, originate loan) must reference.',
              '',
              'Product registration is a governed activity; in production it is gated through the Product Council workflow in Glass. The API itself does not enforce this; your tenant config should restrict who holds the writing role.'
            ].join('\n'),
            requestExample: pdRegReq,
            responseExample: { status: 200, body: pdRegResp },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/product-directory/register', { body: pdRegReq, idempotent: 'prod-CA-EVERYDAY-USD-V2' }),
              node:   nodeBlock('POST', '/stub/product-directory/register', { body: pdRegReq, idempotent: 'prod-CA-EVERYDAY-USD-V2' }),
              python: pyBlock('POST',   '/stub/product-directory/register', { body: pdRegReq, idempotent: 'prod-CA-EVERYDAY-USD-V2' })
            }
          }
        },
        '/stub/product-directory/{product-directory-id}/retrieve': {
          get: {
            summary: 'Retrieve a product definition',
            description: 'Returns the full product definition: type, family, currency, features, fee schedule references, rate references, and lifecycle status. Strongly consistent.',
            responseExample: { status: 200, body: Object.assign({}, pdRegResp, { ProductType: 'CurrentAccount', ProductName: 'Everyday Checking USD', ProductFamily: 'RetailDeposits', BaseCurrency: 'USD', ProductFeatures: pdRegReq.ProductFeatures, LastModifiedAt: iso(86400000) }) },
            codeSamples: {
              curl:   curlBlock('GET', '/stub/product-directory/prod_ca_everyday_usd_v2/retrieve', {}),
              node:   nodeBlock('GET', '/stub/product-directory/prod_ca_everyday_usd_v2/retrieve', {}),
              python: pyBlock('GET',   '/stub/product-directory/prod_ca_everyday_usd_v2/retrieve', {})
            }
          }
        },
        '/stub/product-directory/{product-directory-id}/update': {
          put: {
            summary: 'Update a product definition',
            description: 'Updates the mutable attributes of a product (description, features list, marketing copy). Pricing and lifecycle fields are immutable on a registered product; to change them, register a new product version and migrate.',
            requestExample: { ProductDescription: 'No-fee everyday checking, USD, US residents. Now with Zelle.', ProductFeatures: ['DebitCard', 'OnlineBillPay', 'OverdraftOptIn', 'Zelle'] },
            responseExample: { status: 200, body: Object.assign({}, pdRegResp, { Version: 3, LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/product-directory/prod_ca_everyday_usd_v2/update', { body: { ProductFeatures: ['DebitCard', 'OnlineBillPay', 'OverdraftOptIn', 'Zelle'] } }),
              node:   nodeBlock('PUT', '/stub/product-directory/prod_ca_everyday_usd_v2/update', { body: { ProductFeatures: ['DebitCard', 'OnlineBillPay', 'OverdraftOptIn', 'Zelle'] } }),
              python: pyBlock('PUT',   '/stub/product-directory/prod_ca_everyday_usd_v2/update', { body: { ProductFeatures: ['DebitCard', 'OnlineBillPay', 'OverdraftOptIn', 'Zelle'] } })
            }
          }
        },
        '/stub/product-directory/{product-directory-id}/sales-and-marketing/register': {
          post: {
            summary: 'Attach sales-and-marketing collateral to a product',
            description: 'Attaches a sales-and-marketing record to a product: campaign references, eligible channels, target segments, current promotional pricing, regulatory disclosures. Storefront and offer-engine surfaces read this rather than the bare product record.',
            requestExample: { CampaignReference: 'cmp_summer_savings_2026', EligibleChannels: ['Web', 'MobileApp'], TargetSegments: ['NewToBank_US'], PromotionalRate: { annualEquivalent: '4.75', validUntil: '2026-09-30' } },
            responseExample: { status: 200, body: { SalesAndMarketingInstanceReference: { salesAndMarketingId: 'sam_01HZQFPRDSAM01' }, Status: 'Active', CreatedAt: iso(60000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/product-directory/prod_ca_everyday_usd_v2/sales-and-marketing/register', { body: { CampaignReference: 'cmp_summer_savings_2026', EligibleChannels: ['Web', 'MobileApp'] } }),
              node:   nodeBlock('POST', '/stub/product-directory/prod_ca_everyday_usd_v2/sales-and-marketing/register', { body: { CampaignReference: 'cmp_summer_savings_2026', EligibleChannels: ['Web', 'MobileApp'] } }),
              python: pyBlock('POST',   '/stub/product-directory/prod_ca_everyday_usd_v2/sales-and-marketing/register', { body: { CampaignReference: 'cmp_summer_savings_2026', EligibleChannels: ['Web', 'MobileApp'] } })
            }
          }
        },
        '/stub/product-directory/{product-directory-id}/servicing/{servicing-id}/retrieve': {
          get: {
            summary: 'Retrieve a product servicing profile',
            description: 'Returns the servicing profile for a product: SLAs, supported servicing channels, fee waiver rules, in-life lifecycle transitions. Used by Glass to render the product-servicing operator view.',
            responseExample: { status: 200, body: { ServicingInstanceReference: { servicingId: 'svc_01HZQFPRDSVC01' }, ServicingSLA: { responseHours: 24 }, SupportedChannels: ['Phone', 'Chat', 'Branch'], FeeWaiverRules: ['StudentSegment', 'MilitarySegment'], LastModifiedAt: iso(86400000) } },
            codeSamples: {
              curl:   curlBlock('GET', '/stub/product-directory/prod_ca_everyday_usd_v2/servicing/svc_01HZQFPRDSVC01/retrieve', {}),
              node:   nodeBlock('GET', '/stub/product-directory/prod_ca_everyday_usd_v2/servicing/svc_01HZQFPRDSVC01/retrieve', {}),
              python: pyBlock('GET',   '/stub/product-directory/prod_ca_everyday_usd_v2/servicing/svc_01HZQFPRDSVC01/retrieve', {})
            }
          }
        }
      };
    })(),

    // =====================================================================
    // CUSTOMER PRODUCT AND SERVICE DIRECTORY
    // =====================================================================
    'customer-product-service-directory': (function () {
      var cpsRegReq = {
        CustomerReference: { customerId: 'cust_8KQ2vP7nR3xLmYzA' },
        DirectoryProfile: { PreferredContactChannel: 'Email', PreferredLanguage: 'en-US' }
      };
      var cpsRegResp = {
        CustomerProductAndServiceDirectoryInstanceReference: { customerDirectoryId: 'cpsd_01HZQGCPSD0001' },
        CustomerReference: cpsRegReq.CustomerReference,
        Status: 'Active',
        CreatedAt: iso(0)
      };
      return {
        '/v1/customer-product-and-service-directory/register': {
          post: {
            summary: 'Register the customer\'s product-and-service directory entry',
            description: [
              'Creates the per-customer directory entry that catalogues every product and service the customer holds across the bank. The Glass operator console reads this directory rather than walking each product domain individually.',
              '',
              'Call this once per customer, after Party Reference Data registration. Subsequent product purchases are recorded via `product/register` against this directory entry.'
            ].join('\n'),
            requestExample: cpsRegReq,
            responseExample: { status: 200, body: cpsRegResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/customer-product-and-service-directory/register', { body: cpsRegReq, idempotent: 'cpsd-cust_8KQ2vP7nR3xLmYzA' }),
              node:   nodeBlock('POST', '/v1/customer-product-and-service-directory/register', { body: cpsRegReq, idempotent: 'cpsd-cust_8KQ2vP7nR3xLmYzA' }),
              python: pyBlock('POST',   '/v1/customer-product-and-service-directory/register', { body: cpsRegReq, idempotent: 'cpsd-cust_8KQ2vP7nR3xLmYzA' })
            }
          }
        },
        '/v1/customer-product-and-service-directory/{customer-product-and-service-directory-id}/retrieve': {
          get: {
            summary: 'Retrieve a customer\'s directory entry by directory ID',
            description: 'Returns the directory entry including the full enumerated list of product holdings. Use when you already hold the `customerDirectoryId`; use the `{party-ref-id}/customer-products-services/retrieve` variant when you only have the `customerId`.',
            responseExample: { status: 200, body: Object.assign({}, cpsRegResp, { ProductHoldings: [{ productId: 'prod_ca_everyday_usd_v2', instanceId: 'acc_01HZQBCURRACC01', kind: 'CurrentAccount' }, { productId: 'prod_sa_highyield_usd_v1', instanceId: 'sav_01HZQCSAVACC01', kind: 'SavingsAccount' }] }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/retrieve', {}),
              node:   nodeBlock('GET', '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/retrieve', {}),
              python: pyBlock('GET',   '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/retrieve', {})
            }
          }
        },
        '/v1/customer-product-and-service-directory/{party-ref-id}/customer-products-services/retrieve': {
          get: {
            summary: 'Retrieve a customer\'s products and services by party ID',
            description: 'Lookup by the customer\'s `partyId` rather than by the directory entry ID. This is the entry point the Glass dashboard uses when it knows the customer but not the directory record. Strongly consistent.',
            responseExample: { status: 200, body: { CustomerReference: { customerId: 'cust_8KQ2vP7nR3xLmYzA' }, ProductHoldings: [{ productId: 'prod_ca_everyday_usd_v2', instanceId: 'acc_01HZQBCURRACC01', kind: 'CurrentAccount', status: 'Active' }, { productId: 'prod_sa_highyield_usd_v1', instanceId: 'sav_01HZQCSAVACC01', kind: 'SavingsAccount', status: 'Active' }], TotalRelationshipValue: { value: '7059.97', currency: 'USD' } } },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/customer-product-and-service-directory/cust_8KQ2vP7nR3xLmYzA/customer-products-services/retrieve', {}),
              node:   nodeBlock('GET', '/v1/customer-product-and-service-directory/cust_8KQ2vP7nR3xLmYzA/customer-products-services/retrieve', {}),
              python: pyBlock('GET',   '/v1/customer-product-and-service-directory/cust_8KQ2vP7nR3xLmYzA/customer-products-services/retrieve', {})
            }
          }
        },
        '/v1/customer-product-and-service-directory/{customer-product-and-service-directory-id}/product/register': {
          post: {
            summary: 'Record a new product holding against the customer',
            description: 'Records that the customer has acquired a new product. Called automatically by the originating domain (Current Account, Savings Account, etc.) on successful `initiate`; rarely invoked directly. The product holding remains until explicitly closed.',
            requestExample: { ProductReference: { productId: 'prod_sa_highyield_usd_v1' }, InstanceReference: { savingsAccountId: 'sav_01HZQCSAVACC01' }, Kind: 'SavingsAccount' },
            responseExample: { status: 200, body: { ProductHoldingInstanceReference: { productHoldingId: 'ph_01HZQGCPSDPH02' }, Status: 'Active', RegisteredAt: iso(60000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/product/register', { body: { ProductReference: { productId: 'prod_sa_highyield_usd_v1' }, Kind: 'SavingsAccount' } }),
              node:   nodeBlock('POST', '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/product/register', { body: { ProductReference: { productId: 'prod_sa_highyield_usd_v1' }, Kind: 'SavingsAccount' } }),
              python: pyBlock('POST',   '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/product/register', { body: { ProductReference: { productId: 'prod_sa_highyield_usd_v1' }, Kind: 'SavingsAccount' } })
            }
          }
        },
        '/v1/customer-product-and-service-directory/{customer-product-and-service-directory-id}/update': {
          put: {
            summary: 'Update the customer directory entry',
            description: 'Updates the mutable header fields of the customer directory entry: preferred contact channel, preferred language, marketing-consent flags. Product holdings are managed through the `product/register` and matching close endpoints, never through this call.',
            requestExample: { DirectoryProfile: { PreferredContactChannel: 'MobileApp', PreferredLanguage: 'en-US', MarketingConsent: false } },
            responseExample: { status: 200, body: Object.assign({}, cpsRegResp, { DirectoryProfile: { PreferredContactChannel: 'MobileApp', PreferredLanguage: 'en-US', MarketingConsent: false }, LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/update', { body: { DirectoryProfile: { PreferredContactChannel: 'MobileApp' } } }),
              node:   nodeBlock('PUT', '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/update', { body: { DirectoryProfile: { PreferredContactChannel: 'MobileApp' } } }),
              python: pyBlock('PUT',   '/v1/customer-product-and-service-directory/cpsd_01HZQGCPSD0001/update', { body: { DirectoryProfile: { PreferredContactChannel: 'MobileApp' } } })
            }
          }
        }
      };
    })(),

    // =====================================================================
    // CUSTOMER OFFER
    // =====================================================================
    'customer-offer': (function () {
      var coInitReq = {
        CustomerReference: { customerId: 'cust_8KQ2vP7nR3xLmYzA' },
        OfferType: 'ProductCrossSell',
        SourceCampaignReference: 'cmp_summer_savings_2026',
        OfferProductReference: { productId: 'prod_sa_highyield_usd_v1' },
        OfferTerms: { promotionalRate: '4.75', validUntil: '2026-09-30', minimumOpeningDeposit: { value: '1000.00', currency: 'USD' } },
        OfferChannel: 'MobileApp'
      };
      var coInitResp = {
        CustomerOfferInstanceReference: { customerOfferId: 'off_01HZQHCUSTOFF01' },
        Status: 'Presented',
        OfferExpiresAt: '2026-09-30',
        PresentedAt: iso(0)
      };
      return {
        '/v1/customer-offer/initiate': {
          post: {
            summary: 'Initiate a customer offer',
            description: [
              'Initiates and presents an offer to a specific customer. The offer is recorded as `Presented` immediately; subsequent customer interactions (`Accepted`, `Declined`, `Expired`) are captured via the matching update endpoints or by event.',
              '',
              'Accepting an offer typically converts it: the platform calls Customer Agreement `evaluate` and the relevant product `initiate` in a coordinated workflow. See [Conventions → Workflow conversion](#/docs/glue/api-explorer/conventions).'
            ].join('\n'),
            requestExample: coInitReq,
            responseExample: { status: 200, body: coInitResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/customer-offer/initiate', { body: coInitReq, idempotent: 'off-cmp_summer_savings_2026-cust_8KQ2vP7nR3xLmYzA' }),
              node:   nodeBlock('POST', '/v1/customer-offer/initiate', { body: coInitReq, idempotent: 'off-cmp_summer_savings_2026-cust_8KQ2vP7nR3xLmYzA' }),
              python: pyBlock('POST',   '/v1/customer-offer/initiate', { body: coInitReq, idempotent: 'off-cmp_summer_savings_2026-cust_8KQ2vP7nR3xLmYzA' })
            }
          }
        },
        '/v1/customer-offer/{customer-offer-id}/retrieve': {
          get: {
            summary: 'Retrieve a customer offer',
            description: 'Returns the offer header, terms, current status, and any associated agreement and product-instance references created on acceptance.',
            responseExample: { status: 200, body: Object.assign({}, coInitResp, { Status: 'Accepted', AcceptedAt: iso(86400000), ResultingAgreementReference: { customerAgreementId: 'agr_01HZQHCUSTOFFAGR01' }, ResultingProductInstance: { savingsAccountId: 'sav_01HZQHCUSTOFFSAV01' } }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/customer-offer/off_01HZQHCUSTOFF01/retrieve', {}),
              node:   nodeBlock('GET', '/v1/customer-offer/off_01HZQHCUSTOFF01/retrieve', {}),
              python: pyBlock('GET',   '/v1/customer-offer/off_01HZQHCUSTOFF01/retrieve', {})
            }
          }
        },
        '/v1/customer-offer/{customer-offer-id}/update': {
          put: {
            summary: 'Update an offer\'s status',
            description: 'Updates the offer status: `Accepted`, `Declined`, or `Withdrawn` (bank-initiated). `Expired` is set automatically by the platform when `OfferExpiresAt` passes. Moving to `Accepted` triggers the conversion workflow.',
            requestExample: { Status: 'Accepted', AcceptanceChannel: 'MobileApp', AcceptanceConfirmation: { confirmationToken: 'confirm_01HZQHACK001' } },
            responseExample: { status: 200, body: Object.assign({}, coInitResp, { Status: 'Accepted', AcceptedAt: iso(86400000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/v1/customer-offer/off_01HZQHCUSTOFF01/update', { body: { Status: 'Accepted', AcceptanceChannel: 'MobileApp' } }),
              node:   nodeBlock('PUT', '/v1/customer-offer/off_01HZQHCUSTOFF01/update', { body: { Status: 'Accepted', AcceptanceChannel: 'MobileApp' } }),
              python: pyBlock('PUT',   '/v1/customer-offer/off_01HZQHCUSTOFF01/update', { body: { Status: 'Accepted', AcceptanceChannel: 'MobileApp' } })
            }
          }
        },
        '/v1/customer-offer/{customer-offer-id}/agreement/{agreement-id}/update': {
          put: {
            summary: 'Update the agreement subordinate to an accepted offer',
            description: 'Updates the agreement that was created when the customer accepted the offer. Used to apply offer-specific terms (promotional rate window, waived fees) onto the canonical customer agreement. Once the promotional window expires, the agreement falls back to product defaults automatically; you do not need a second update call.',
            requestExample: { AppliedPromotionalTerms: ['promo_summer_savings_2026'], EffectiveFrom: '2026-06-02', EffectiveTo: '2026-09-30' },
            responseExample: { status: 200, body: { AgreementInstanceReference: { agreementId: 'agr_01HZQHCUSTOFFAGR01' }, AppliedPromotionalTerms: ['promo_summer_savings_2026'], Status: 'Active', LastModifiedAt: iso(180000) } },
            codeSamples: {
              curl:   curlBlock('PUT', '/v1/customer-offer/off_01HZQHCUSTOFF01/agreement/agr_01HZQHCUSTOFFAGR01/update', { body: { AppliedPromotionalTerms: ['promo_summer_savings_2026'] } }),
              node:   nodeBlock('PUT', '/v1/customer-offer/off_01HZQHCUSTOFF01/agreement/agr_01HZQHCUSTOFFAGR01/update', { body: { AppliedPromotionalTerms: ['promo_summer_savings_2026'] } }),
              python: pyBlock('PUT',   '/v1/customer-offer/off_01HZQHCUSTOFF01/agreement/agr_01HZQHCUSTOFFAGR01/update', { body: { AppliedPromotionalTerms: ['promo_summer_savings_2026'] } })
            }
          }
        },
        '/v1/customer-offer/{customer-offer-id}/product-initialization/{product-initialization-id}/retrieve': {
          get: {
            summary: 'Retrieve the product-initialisation record for an accepted offer',
            description: 'Returns the product-initialisation record produced when the offer was accepted: which product instance was created, against which agreement, with what initial state. Use this when reconciling offers to opened accounts.',
            responseExample: { status: 200, body: { ProductInitializationInstanceReference: { productInitializationId: 'pinit_01HZQHPROD01' }, OfferReference: { customerOfferId: 'off_01HZQHCUSTOFF01' }, ProductReference: { productId: 'prod_sa_highyield_usd_v1' }, ProductInstanceReference: { savingsAccountId: 'sav_01HZQHCUSTOFFSAV01' }, AgreementReference: { customerAgreementId: 'agr_01HZQHCUSTOFFAGR01' }, Status: 'Completed', CompletedAt: iso(86460000) } },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/customer-offer/off_01HZQHCUSTOFF01/product-initialization/pinit_01HZQHPROD01/retrieve', {}),
              node:   nodeBlock('GET', '/v1/customer-offer/off_01HZQHCUSTOFF01/product-initialization/pinit_01HZQHPROD01/retrieve', {}),
              python: pyBlock('GET',   '/v1/customer-offer/off_01HZQHCUSTOFF01/product-initialization/pinit_01HZQHPROD01/retrieve', {})
            }
          }
        }
      };
    })(),

    // =====================================================================
    // DOCUMENT DIRECTORY
    // =====================================================================
    'document-directory': (function () {
      var ddRegReq = {
        DocumentType: 'CustomerAgreement',
        DocumentTitle: 'Master Services Agreement v3 (US, 2026)',
        DocumentLanguage: 'en-US',
        DocumentJurisdiction: { country: 'US' },
        StorageReference: { provider: 'formpipe', objectKey: 'finx/agreements/msa_v3_2026.pdf', sha256: 'b8e1f0e2c4f8a6b1c0d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4' },
        EffectiveFrom: '2026-06-01'
      };
      var ddRegResp = {
        DocumentDirectoryInstanceReference: { documentId: 'doc_msa_v3_2026' },
        Status: 'Active',
        Version: 1,
        RegisteredAt: iso(0)
      };
      return {
        '/v1/document-directory/register': {
          post: {
            summary: 'Register a document in the directory',
            description: [
              'Registers a document in the central directory. The directory does not store the document body; it stores the storage reference (Formpipe object key, S3 path, etc.) plus the cryptographic hash. Every later API call (link a document to an agreement, attach to an offer) references the returned `documentId`.',
              '',
              '**Hash integrity.** The `sha256` is required and verified on retrieval. A mismatch surfaces as a `409 DocumentHashMismatch` and is treated as a security incident.'
            ].join('\n'),
            requestExample: ddRegReq,
            responseExample: { status: 200, body: ddRegResp },
            codeSamples: {
              curl:   curlBlock('POST', '/v1/document-directory/register', { body: ddRegReq, idempotent: 'doc-msa_v3_2026' }),
              node:   nodeBlock('POST', '/v1/document-directory/register', { body: ddRegReq, idempotent: 'doc-msa_v3_2026' }),
              python: pyBlock('POST',   '/v1/document-directory/register', { body: ddRegReq, idempotent: 'doc-msa_v3_2026' })
            }
          }
        },
        '/v1/document-directory/{document-directory-id}/retrieve': {
          get: {
            summary: 'Retrieve a document header',
            description: 'Returns the document metadata header (type, title, language, jurisdiction, storage reference, hash, version, status). To stream the document body, call the storage provider directly using the returned `StorageReference`; FinX does not proxy bytes.',
            responseExample: { status: 200, body: Object.assign({}, ddRegResp, { DocumentType: 'CustomerAgreement', DocumentTitle: 'Master Services Agreement v3 (US, 2026)', StorageReference: ddRegReq.StorageReference, EffectiveFrom: '2026-06-01' }) },
            codeSamples: {
              curl:   curlBlock('GET', '/v1/document-directory/doc_msa_v3_2026/retrieve', {}),
              node:   nodeBlock('GET', '/v1/document-directory/doc_msa_v3_2026/retrieve', {}),
              python: pyBlock('GET',   '/v1/document-directory/doc_msa_v3_2026/retrieve', {})
            }
          }
        },
        '/v1/document-directory/{document-directory-id}/update': {
          put: {
            summary: 'Update mutable document metadata',
            description: 'Updates the mutable metadata (title, language tags, jurisdiction). The storage reference and hash are immutable; to replace a document body, register a new document and (optionally) supersede the old one through your tenant\'s document-lifecycle workflow.',
            requestExample: { DocumentTitle: 'Master Services Agreement v3 (US, 2026, rev a)' },
            responseExample: { status: 200, body: Object.assign({}, ddRegResp, { Version: 2, LastModifiedAt: iso(180000) }) },
            codeSamples: {
              curl:   curlBlock('PUT', '/v1/document-directory/doc_msa_v3_2026/update', { body: { DocumentTitle: 'Master Services Agreement v3 (US, 2026, rev a)' } }),
              node:   nodeBlock('PUT', '/v1/document-directory/doc_msa_v3_2026/update', { body: { DocumentTitle: 'Master Services Agreement v3 (US, 2026, rev a)' } }),
              python: pyBlock('PUT',   '/v1/document-directory/doc_msa_v3_2026/update', { body: { DocumentTitle: 'Master Services Agreement v3 (US, 2026, rev a)' } })
            }
          }
        },
        '/stub/document-directory/{document-directory-id}/document-version-properties/register': {
          post: {
            summary: 'Register a new version of a document',
            description: 'Registers a new version of an existing document (new storage reference, new hash, new effective date). The previous version remains queryable for audit; only the latest version is returned by the bare `retrieve` call unless `?version=` is supplied.',
            requestExample: { StorageReference: { provider: 'formpipe', objectKey: 'finx/agreements/msa_v3_2026_revb.pdf', sha256: 'c9f2a1b3d5e7c8d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4' }, EffectiveFrom: '2026-07-01', ChangeNarrative: 'Add Zelle service terms (clause 14.7).' },
            responseExample: { status: 200, body: { DocumentVersionPropertiesInstanceReference: { versionPropertiesId: 'dvp_01HZQIDOCVER01' }, Version: 2, Status: 'Active', EffectiveFrom: '2026-07-01', RegisteredAt: iso(60000) } },
            codeSamples: {
              curl:   curlBlock('POST', '/stub/document-directory/doc_msa_v3_2026/document-version-properties/register', { body: { EffectiveFrom: '2026-07-01', ChangeNarrative: 'Add Zelle service terms.' } }),
              node:   nodeBlock('POST', '/stub/document-directory/doc_msa_v3_2026/document-version-properties/register', { body: { EffectiveFrom: '2026-07-01', ChangeNarrative: 'Add Zelle service terms.' } }),
              python: pyBlock('POST',   '/stub/document-directory/doc_msa_v3_2026/document-version-properties/register', { body: { EffectiveFrom: '2026-07-01', ChangeNarrative: 'Add Zelle service terms.' } })
            }
          }
        },
        '/stub/document-directory/{document-directory-id}/document-verification-properties/{document-verification-properties-id}/execute': {
          put: {
            summary: 'Execute a document verification',
            description: 'Executes a verification of a document version: recomputes the hash from the stored bytes, checks the signature, and updates the verification record. Run on a schedule (daily for active customer-facing agreements) and on demand before audits.',
            requestExample: { VerificationType: 'HashAndSignature', AuthorisedBy: 'op_compliance_07' },
            responseExample: { status: 200, body: { DocumentVerificationPropertiesInstanceReference: { verificationPropertiesId: 'dvp_verify_01HZQIDOCVER02' }, VerificationResult: 'Passed', VerifiedAt: iso(86460000), VerifierReference: 'finx_doc_verifier_v3' } },
            codeSamples: {
              curl:   curlBlock('PUT', '/stub/document-directory/doc_msa_v3_2026/document-verification-properties/dvp_verify_01HZQIDOCVER02/execute', { body: { VerificationType: 'HashAndSignature' } }),
              node:   nodeBlock('PUT', '/stub/document-directory/doc_msa_v3_2026/document-verification-properties/dvp_verify_01HZQIDOCVER02/execute', { body: { VerificationType: 'HashAndSignature' } }),
              python: pyBlock('PUT',   '/stub/document-directory/doc_msa_v3_2026/document-verification-properties/dvp_verify_01HZQIDOCVER02/execute', { body: { VerificationType: 'HashAndSignature' } })
            }
          }
        }
      };
    })()

    // The remaining BIAN admin/config families are not curated. Endpoints
    // without an overlay still get auto-generated cURL / Node / Python
    // samples from main.js.
  };
})();
