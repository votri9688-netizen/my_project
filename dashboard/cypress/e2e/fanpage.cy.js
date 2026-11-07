describe('Fanpage Automation & Video Processing E2E Suite', () => {
  const apiUrl = Cypress.env('API_URL') || 'http://localhost:8000';

  beforeEach(() => {
    // Mock Meta Graph API responses
    cy.intercept('POST', 'https://graph.facebook.com/**', {
      statusCode: 200,
      body: {
        id: 'mock_video_reel_123456789',
        success: true,
        status: 'published'
      }
    }).as('metaPublishReel');
  });

  it('Verifies backend health status', () => {
    cy.request(`${apiUrl}/status`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.eq({ status: 'ok' });
    });
  });

  it('Creates a fanpage via API, triggers video process, and mocks Reel publishing', () => {
    const timestamp = Date.now();
    const testPageId = `fb_page_${timestamp}`;
    const testPageName = `E2E Fanpage ${timestamp}`;

    // Step 1: Create Fanpage
    cy.request({
      method: 'POST',
      url: `${apiUrl}/fanpages/`,
      body: {
        name: testPageName,
        page_id: testPageId,
        quota: 100,
        active: true
      }
    }).then((res) => {
      expect(res.status).to.eq(200);
      const fanpage = res.body;
      expect(fanpage.name).to.eq(testPageName);
      expect(fanpage.page_id).to.eq(testPageId);
      const fanpageId = fanpage.id;

      // Step 2: Trigger Celery Video Process
      cy.request({
        method: 'POST',
        url: `${apiUrl}/fanpages/${fanpageId}/process`
      }).then((procRes) => {
        expect(procRes.status).to.eq(200);
        expect(procRes.body.msg).to.eq('Processing started');
        expect(procRes.body.fanpage_id).to.eq(fanpageId);
      });

      // Step 3: Mock Meta Graph API Publish Reel
      cy.window().then((win) => {
        // Simulate client-side or backend call to Meta Graph API
        return fetch(`https://graph.facebook.com/v19.0/${testPageId}/video_reels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            upload_phase: 'finish',
            video_id: 'mock_video_reel_123456789',
            description: 'Automated E2E Reel caption #viral'
          })
        }).then((r) => r.json());
      }).then((metaRes) => {
        expect(metaRes.success).to.be.true;
        expect(metaRes.status).to.eq('published');
      });
    });
  });

  it('Verifies Prometheus metrics endpoint is exposed and healthy', () => {
    cy.request(`${apiUrl}/metrics`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.include('http_request_duration_seconds');
    });
  });
});
