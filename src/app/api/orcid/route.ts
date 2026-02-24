import { NextResponse } from 'next/server';
import { getSystemSecrets } from '@/services/configService';

const ORCID_API_URL = 'https://pub.orcid.org/v3.0';
const ORCID_TOKEN_URL = 'https://orcid.org/oauth/token';

async function getOrcidToken(clientId: string, clientSecret: string) {
  const response = await fetch(ORCID_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: '/read-public',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to obtain ORCiD token');
  }

  return await response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const q = searchParams.get('q');
  const orcidId = searchParams.get('orcidId');

  const secrets = await getSystemSecrets();
  const clientId = secrets.orcid_client_id;
  const clientSecret = secrets.orcid_client_secret;

  if (!clientId || !clientSecret || clientId === 'YOUR_CLIENT_ID_HERE') {
    return NextResponse.json({ error: 'ORCiD Credentials not configured' }, { status: 500 });
  }

  try {
    const { access_token } = await getOrcidToken(clientId, clientSecret);

    if (action === 'search') {
      let finalQ = q;
      const start = searchParams.get('start') || '0';
      const rows = searchParams.get('rows') || '25';

      if (!finalQ) {
        // If no query, default to institutional search based on scope
        const scope = searchParams.get('scope');
        if (scope === 'vet') {
          finalQ = 'affiliation-org-name:"Kasetsart University" AND affiliation-org-name:"Veterinary Medicine"';
        } else {
          finalQ = 'affiliation-org-name:"Kasetsart University"';
        }
      }

      console.log(`ORCiD Search (scope=${searchParams.get('scope')}, start=${start}): ${finalQ}`);

      const res = await fetch(`${ORCID_API_URL}/expanded-search/?q=${encodeURIComponent(finalQ)}&start=${start}&rows=${rows}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
      });
      const data = await res.json();
      
      const numFound = data['num-found'] || 0;
      const results = data['expanded-result']?.map((r: any) => ({
        orcidId: r['orcid-id'],
        givenNames: r['given-names'],
        familyNames: r['family-names'],
        institution: r['institution-name']?.[0] || ""
      })) || [];

      return NextResponse.json({ result: results, numFound });
    }

    if (action === 'works' && orcidId) {
      const res = await fetch(`${ORCID_API_URL}/${orcidId}/works`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
      });
      const data = await res.json();
      
      // Map ORCiD works to ResearchRecord format
      const works = data.group?.map((g: any) => {
        const workSummary = g['work-summary']?.[0];
        if (!workSummary) return null;

        const title = workSummary.title?.title?.value || "Untitled";
        const year = workSummary['publication-date']?.year?.value || "Unknown";
        const journal = workSummary['journal-title']?.value || "";
        const doi = workSummary['external-ids']?.['external-id']?.find((id: any) => id['external-id-type'] === 'doi')?.['external-id-value'];
        
        return {
          title,
          year,
          journal,
          doi,
          imported_from: 'orcid_api',
          authors: "", // ORCID ID results need extra fetch for full author list, placeholder for now
          is_deleted: false
        };
      }).filter(Boolean) || [];

      return NextResponse.json({ works });
    }

    return NextResponse.json({ error: 'Invalid action or parameters' }, { status: 400 });
  } catch (error: any) {
    console.error("ORCiD Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
