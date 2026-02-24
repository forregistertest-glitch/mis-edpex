import { NextResponse } from 'next/server';
import { getSystemSecrets } from '@/services/configService';

const SCOPUS_API_URL = 'https://api.elsevier.com/content/search/scopus';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get('authorId');
  const query = searchParams.get('query');
  const affiliation = searchParams.get('affiliation');
  const year = searchParams.get('year');
  const start = searchParams.get('start') || '0';
  const view = searchParams.get('view') || 'STANDARD';

  // Check API Key configuration from Firestore Secrets
  const secrets = await getSystemSecrets();
  const scopusApiKey = secrets.scopus_api_key;

  if (!scopusApiKey) {
    return NextResponse.json({
      error: 'SCOPUS_API_KEY is not configured in system settings'
    }, { status: 500 });
  }

  try {
    let scopusQuery = '';

    if (authorId) {
      // Precision search by Author ID
      scopusQuery = `AU-ID(${authorId})`;
    } else if (query) {
      // General search (Name, Title, etc.)
      scopusQuery = query;
    }

    if (affiliation) {
      let affilQuery = '';
      if (affiliation === 'vet') {
        affilQuery = `AF-ID(60021944) AND AFFILORG("Veterinary Medicine")`;
      } else {
        affilQuery = `AF-ID(${affiliation})`;
      }

      if (scopusQuery) {
        scopusQuery = `${affilQuery} AND (${scopusQuery})`;
      } else {
        scopusQuery = affilQuery;
      }
    }

    if (year && year !== 'all') {
      if (scopusQuery) {
        scopusQuery = `(${scopusQuery}) AND PUBYEAR IS ${year}`;
      } else {
        scopusQuery = `PUBYEAR IS ${year}`;
      }
    }

    if (!scopusQuery) {
      return NextResponse.json({ error: 'Missing search parameters' }, { status: 400 });
    }

    console.log(`Fetching Scopus (start=${start}): ${scopusQuery}`);

    const headers: Record<string, string> = {
      'X-ELS-APIKey': scopusApiKey,
      'Accept': 'application/json'
    };

    if (secrets.scopus_inst_token) {
      headers['X-ELS-Insttoken'] = secrets.scopus_inst_token;
    }

    const response = await fetch(`${SCOPUS_API_URL}?query=${encodeURIComponent(scopusQuery)}&count=25&start=${start}&sort=-coverDate&view=${view}`, {
      headers
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Scopus API Error:", response.status, errText);
      return NextResponse.json({ error: `Scopus API Error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Scopus Service Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
