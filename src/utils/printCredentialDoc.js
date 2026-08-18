/**
 * Generates and triggers print preview window for Team Credentials Sheet
 */
export function printCredentialSheet({ teamName, teamCode, password, syntheticEmail, members }) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups to print the Credential Sheet.");
    return;
  }

  const memberItems = (members || []).map(m => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px; font-weight: 500;">${m.name}</td>
      <td style="padding: 8px;">${m.email}</td>
      <td style="padding: 8px;">${m.role || 'Member'}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CREDENTIAL SHEET // ${teamCode}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #ffffff;
            color: #000000;
            padding: 40px;
            margin: 0;
          }
          .header {
            border-bottom: 3px solid #dc2626;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            color: #000;
          }
          .subtitle {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
          }
          .cred-box {
            background-color: #f8fafc;
            border: 2px dashed #000000;
            padding: 25px;
            margin-bottom: 30px;
            border-radius: 4px;
          }
          .label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .value {
            font-family: monospace;
            font-size: 22px;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 20px;
            letter-spacing: 2px;
          }
          .value-sub {
            font-family: monospace;
            font-size: 14px;
            color: #0f172a;
            margin-bottom: 15px;
          }
          .warning-banner {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 12px 16px;
            font-size: 12px;
            color: #991b1b;
            margin-bottom: 30px;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            text-align: left;
            padding: 8px;
            border-bottom: 2px solid #000;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">AUTOMATION HACKATHON 2026</div>
          <div class="subtitle">CONFIDENTIAL TEAM ACCESS CREDENTIAL SHEET</div>
        </div>

        <div class="warning-banner">
          <strong>IMPORTANT SECURITY NOTICE:</strong> Keep this credential sheet safe. Passkeys will NEVER be displayed again or sent via email. Present this sheet at the Team Access Gate during the event.
        </div>

        <div style="margin-bottom: 20px;">
          <div class="label">TEAM NAME</div>
          <div style="font-size: 18px; font-weight: bold; color: #000;">${teamName}</div>
        </div>

        <div class="cred-box">
          <div class="label">8-DIGIT TEAM CODE</div>
          <div class="value">${teamCode}</div>

          <div class="label">SECRET PASSKEY</div>
          <div class="value">${password}</div>

          <div class="label">INTERNAL SYNTHETIC ID</div>
          <div class="value-sub">${syntheticEmail}</div>
        </div>

        <div style="margin-top: 30px;">
          <div class="label" style="margin-bottom: 10px;">REGISTERED ROSTER MEMBERS</div>
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email Address</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${memberItems}
            </tbody>
          </table>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleString()} &bull; Automation Hackathon Control Engine &bull; System Ref: ${teamCode}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
