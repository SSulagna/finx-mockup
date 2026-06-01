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

    }

    // The remaining 10 service domains are an open writing backlog. New entries
    // follow the exact shape above. Endpoints with no overlay still get
    // auto-generated cURL / Node / Python samples from main.js.
  };
})();
