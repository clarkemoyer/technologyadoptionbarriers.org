import type { Metadata } from 'next'
import {
  ARTICLE_CLASSES,
  H1_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  PARAGRAPH_CLASSES,
  BODY_LIST_CLASSES,
} from '@/lib/articleStyles'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Zotero Integration - Making of TABS',
  description:
    'How TABS integrates Zotero as the canonical reference library, giving AI agents direct access to vetted academic sources via the pyzotero MCP server and Web API.',
  alternates: {
    canonical: '/making-of-tabs/integrations/zotero',
  },
}

const ZoteroIntegrationPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/making-of-tabs" className="hover:text-blue-600 hover:underline">
                Making of TABS
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li>
              <Link
                href="/making-of-tabs/integrations"
                className="hover:text-blue-600 hover:underline"
              >
                Technical Integrations
              </Link>
              <span className="mx-2" aria-hidden="true">
                ›
              </span>
            </li>
            <li className="text-gray-800" aria-current="page">
              Zotero
            </li>
          </ol>
        </nav>

        <h1 className={H1_CLASSES}>Zotero - Reference Library &amp; Vetted Sources</h1>

        <section className="mb-12 text-gray-800">
          <p className={PARAGRAPH_CLASSES}>
            The TABS project maintains a{' '}
            <a
              href="https://www.zotero.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Zotero
            </a>{' '}
            library of over 3,300 academic references organized across 199 collections. This library
            serves as the canonical, vetted source of truth for every citation in the Culminating
            Research Project (CRP). The Zotero integration gives AI agents direct, programmatic
            access to this archive - enabling citation verification, literature discovery, full-text
            PDF retrieval, and cross-referencing with external databases like Semantic Scholar.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Why Zotero</h2>
          <p className={PARAGRAPH_CLASSES}>
            Academic research demands an auditable chain from claim to source. Every statistic,
            framework reference, and literature review assertion in the CRP traces back to a
            specific Zotero item with a persistent DOI or URL. By exposing this library to AI
            agents, the project ensures that AI-generated content, code comments, and documentation
            can be grounded in verified academic sources rather than hallucinated citations.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Integration Architecture</h2>
          <p className={PARAGRAPH_CLASSES}>
            The integration uses{' '}
            <a
              href="https://github.com/urschrei/pyzotero"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              pyzotero
            </a>{' '}
            (v1.11.0), a production-stable Python client for the Zotero Web API v3 maintained by
            Stephan H&uuml;gel at Trinity College Dublin. The library operates in two modes:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Local API</strong> - Connects to the Zotero desktop application at{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                localhost:23119
              </code>
              . No API key required. Used during interactive development.
            </li>
            <li>
              <strong>Cloud API</strong> - Connects to{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                api.zotero.org
              </code>{' '}
              with an API key. Used in GitHub Actions via the{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                zotero-prod
              </code>{' '}
              environment.
            </li>
          </ul>

          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse text-sm">
              <caption className="sr-only">
                Zotero integration platforms, access methods, and use cases
              </caption>
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Platform
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Access Method
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Use Case
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 pr-4">Claude Desktop</td>
                  <td className="py-2 pr-4">pyzotero MCP (10 tools)</td>
                  <td className="py-2">
                    Interactive research, literature review, Semantic Scholar
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">VS Code / Copilot Chat</td>
                  <td className="py-2 pr-4">pyzotero MCP (10 tools)</td>
                  <td className="py-2">Citation lookup while writing code and documentation</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Claude Code</td>
                  <td className="py-2 pr-4">pyzotero Python library (direct)</td>
                  <td className="py-2">Programmatic library operations and automation</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">GitHub Actions</td>
                  <td className="py-2 pr-4">pyzotero + zotero-prod environment</td>
                  <td className="py-2">CI/CD reference validation and bibliography sync</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>MCP Server - AI Agent Access</h2>
          <p className={PARAGRAPH_CLASSES}>
            The pyzotero MCP server exposes 10 tools to AI agents via the Model Context Protocol.
            When an AI agent needs to verify a citation, find related work, or retrieve a PDF, it
            calls these tools directly.
          </p>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Zotero Library Tools</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <caption className="sr-only">Zotero library tools and their descriptions</caption>
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Tool
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">search</td>
                    <td className="py-2">
                      Query by content, item type, collection, or tag - with optional full-text PDF
                      search
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">get_item</td>
                    <td className="py-2">
                      Retrieve a single item by key - full metadata including abstract, DOI, and
                      creators
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">get_children</td>
                    <td className="py-2">
                      Get child items: PDF attachments, notes, and linked files
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">list_collections</td>
                    <td className="py-2">
                      Browse the full 199-collection hierarchy organized by course, topic, and
                      research area
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">list_tags</td>
                    <td className="py-2">
                      List all tags in the library, optionally filtered by collection
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">get_fulltext</td>
                    <td className="py-2">Extract full-text content from PDF attachments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h3 className={H3_CLASSES}>Semantic Scholar Integration</h3>
            <p className={PARAGRAPH_CLASSES}>
              The MCP server also includes four Semantic Scholar tools that cross-reference external
              academic databases with the local Zotero library. When results are found, the server
              automatically checks whether each paper already exists in the local collection.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <caption className="sr-only">
                  Semantic Scholar integration tools and their descriptions
                </caption>
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th scope="col" className="py-2 pr-4 font-semibold">
                      Tool
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">find_related</td>
                    <td className="py-2">
                      Find semantically similar papers to a given DOI using embeddings
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">get_citations</td>
                    <td className="py-2">
                      Papers that cite a given paper (forward citation graph)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">get_references</td>
                    <td className="py-2">
                      Papers referenced by a given paper (backward citation graph)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">search_semantic_scholar</td>
                    <td className="py-2">
                      Cross-database search with year, open-access, and citation count filters
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Library Overview</h2>
          <p className={PARAGRAPH_CLASSES}>
            The Zotero library contains references accumulated across the full DBA program and CRP
            research, organized into three top-level collections:
          </p>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>Smeal eDBA CBM Personal</strong> - Active research references organized by
              course, topic, and CRP chapter
            </li>
            <li>
              <strong>CBM Old DBA</strong> - Earlier coursework references from the program
            </li>
            <li>
              <strong>Exported Items</strong> - Cross-referenced and shared items
            </li>
          </ul>
          <p className={PARAGRAPH_CLASSES}>
            Within these top-level collections, subcollections mirror the CRP structure: technology
            adoption models, validated scales, survey methodology, industry-specific studies, and
            framework comparisons. This organization allows AI agents to scope searches to specific
            research domains.
          </p>
        </section>

        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Security &amp; Access</h2>
          <ul className={BODY_LIST_CLASSES}>
            <li>
              <strong>API key</strong> - Stored in the{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                zotero-prod
              </code>{' '}
              GitHub environment as <code>ZOTERO_API_KEY</code>, never committed to the repository
            </li>
            <li>
              <strong>Local access</strong> - No API key needed when connecting to the Zotero
              desktop application (localhost only)
            </li>
            <li>
              <strong>Read + write permissions</strong> - The API key has full library access, notes
              access, and write access for collection management
            </li>
            <li>
              <strong>MCP configs gitignored</strong> - Only{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                .vscode/mcp.json.example
              </code>{' '}
              is committed; the live config with credentials is excluded from version control
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            <a
              href="https://pyzotero.readthedocs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-sans text-sm"
            >
              pyzotero Documentation
            </a>
            <a
              href="https://www.zotero.org/support/dev/web_api/v3/start"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-sans text-sm"
            >
              Zotero Web API v3 Docs
            </a>
            <Link
              href="/making-of-tabs/integrations"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm"
            >
              Back to Integrations
            </Link>
          </div>
        </section>
      </article>
    </div>
  )
}

export default ZoteroIntegrationPage
