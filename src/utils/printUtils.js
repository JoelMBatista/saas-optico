/**
 * Utility functions for printing Prescriptions and Lab Orders.
 * Shared between OpticalEngineModule and CRMModule.
 */

export const printPrescription = (patient, rx, exam, diagnosis) => {
    const printContent = `
        <html>
        <head>
            <title>Receta - ${patient?.name || 'Paciente'}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #2B3674; padding-bottom: 10px; }
                .title { font-size: 24px; font-weight: bold; color: #2B3674; }
                .meta { text-align: right; color: #666; font-size: 12px; }
                .info { margin-bottom: 20px; background: #F8F9FA; padding: 15px; border-radius: 8px; font-size: 12px; }
                .table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; border: 1px solid #E0E5F2; border-radius: 8px; overflow: hidden; font-size: 12px; }
                .table th, .table td { padding: 10px; text-align: center; border-bottom: 1px solid #E0E5F2; }
                .table th { background-color: #F4F7FE; font-weight: bold; color: #2B3674; border-right: 1px solid #E0E5F2; }
                .table td { border-right: 1px solid #E0E5F2; }
                .table th:last-child, .table td:last-child { border-right: none; }
                .table tr:last-child td { border-bottom: none; }
                .section-title { font-size: 14px; font-weight: bold; color: #2B3674; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                .footer { margin-top: 40px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                .box { background: white; border: 1px solid #E0E5F2; border-radius: 8px; padding: 15px; min-height: 80px; font-size: 12px; }
                @media print {
                    @page { margin: 0; size: auto; }
                    body { padding: 2cm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="title">Receta Oftalmológica</div>
                    <div style="color: #666; margin-top: 5px;">SaaS Óptica Profesional</div>
                </div>
                <div class="meta">
                    <div><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</div>
                    <div style="margin-top: 5px;"><strong>Folio:</strong> #${Math.floor(Math.random() * 10000)}</div>
                </div>
            </div>
            
            <div class="info">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div><strong>Paciente:</strong> ${patient?.name || '-'}</div>
                    <div><strong>ID:</strong> ${patient?.id || '-'}</div>
                    <div><strong>Edad:</strong> ${patient?.age || '-'}</div>
                    <div><strong>Fecha de Nacimiento:</strong> ${patient?.birthDate || '-'}</div>
                </div>
            </div>
            
            <div class="section-title">
                <span>Rx Final de Lentes</span>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Ojo</th>
                        <th>Esfera</th>
                        <th>Cilindro</th>
                        <th>Eje</th>
                        <th>Adición</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>OD</strong></td>
                        <td>${rx?.od?.sph || exam?.rx_od_vl || '-'}</td>
                        <td>${rx?.od?.cyl || '-'}</td>
                        <td>${rx?.od?.axis || '-'}</td>
                        <td>${rx?.od?.add || exam?.rx_od_add || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>OI</strong></td>
                        <td>${rx?.oi?.sph || exam?.rx_oi_vl || '-'}</td>
                        <td>${rx?.oi?.cyl || '-'}</td>
                        <td>${rx?.oi?.axis || '-'}</td>
                        <td>${rx?.oi?.add || exam?.rx_oi_add || '-'}</td>
                    </tr>
                </tbody>
            </table>

            <div style="display: flex; gap: 20px; margin-bottom: 20px; font-size: 12px;">
                <div style="flex: 1; padding: 10px; background: #F4F7FE; border-radius: 6px; text-align: center;">
                    <strong>DIP (Distancia Interpupilar):</strong> ${exam?.dip || '-'} mm
                </div>
                ${exam?.altura ? `
                <div style="flex: 1; padding: 10px; background: #F4F7FE; border-radius: 6px; text-align: center;">
                    <strong>Altura de Montaje:</strong> ${exam.altura} mm
                </div>` : ''}
            </div>

            ${diagnosis?.medications && diagnosis.medications.length > 0 ? `
            <div class="section-title">
                <span>Receta Médica (Fármacos)</span>
            </div>
            <div class="box" style="margin-bottom: 20px;">
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                    ${diagnosis.medications.map(m => `
                        <li style="margin-bottom: 8px;">
                            <strong>${m.name || 'Sin especificar'}</strong> 
                            ${m.freq ? `- Frecuencia: ${m.freq}` : ''}
                            ${m.duration ? `- Duración: ${m.duration}` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="section-title">
                <span>Indicaciones y Tratamiento</span>
            </div>
            <div class="box">
                ${diagnosis?.plan ? diagnosis.plan.replace(/\n/g, '<br>') : 'Sin indicaciones adicionales.'}
            </div>
            
            <div class="footer">
                <p>Documento generado digitalmente. Consulte a su especialista para cualquier duda.</p>
            </div>
        </body>
        </html>
    `;

    printHtml(printContent);
};

export const printLabOrder = (patient, rx, exam, diagnosis) => {
    const printContent = `
        <html>
        <head>
            <title>Orden de Laboratorio - ${patient?.name || 'Paciente'}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; color: #333; }
                .info { margin-bottom: 30px; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: center; }
                .table th { background-color: #f8f9fa; font-weight: bold; color: #555; }
                .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Orden de Laboratorio</div>
                <div>Fecha: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="info">
                <strong>Paciente:</strong> ${patient?.name || '-'}<br>
                <strong>ID:</strong> ${patient?.id || '-'}<br>
            </div>
            
            <h3>Rx Final</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Ojo</th>
                        <th>Esfera</th>
                        <th>Cilindro</th>
                        <th>Eje</th>
                        <th>Adición</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>OD</strong></td>
                        <td>${rx?.od?.sph || exam?.rx_od_vl || '-'}</td>
                        <td>${rx?.od?.cyl || '-'}</td>
                        <td>${rx?.od?.axis || '-'}</td>
                        <td>${rx?.od?.add || exam?.rx_od_add || '-'}</td>
                    </tr>
                    <tr>
                        <td><strong>OI</strong></td>
                        <td>${rx?.oi?.sph || exam?.rx_oi_vl || '-'}</td>
                        <td>${rx?.oi?.cyl || '-'}</td>
                        <td>${rx?.oi?.axis || '-'}</td>
                        <td>${rx?.oi?.add || exam?.rx_oi_add || '-'}</td>
                    </tr>
                </tbody>
            </table>

            <div style="display: flex; gap: 20px; margin-bottom: 30px; font-family: sans-serif;">
                <div style="flex: 1; padding: 10px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
                    <strong>DIP:</strong> ${exam?.dip || '-'} mm
                </div>
                <div style="flex: 1; padding: 10px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
                    <strong>Altura:</strong> ${exam?.altura || '-'} mm
                </div>
            </div>

            <h3>Especificaciones de Laboratorio</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Diseño</th>
                        <th>Material</th>
                        <th>Tratamiento</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${diagnosis?.lab_design || '-'}</td>
                        <td>${diagnosis?.lab_material || '-'}</td>
                        <td>${diagnosis?.lab_coating || '-'}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                Generado automáticamente por SaaS Óptica
            </div>

        </body>
        </html>
    `;

    printHtml(printContent);
};

const printHtml = (htmlContent) => {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Write content to iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Print iframe content
    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        // Optional: Remove iframe after printing to clean up
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
};
