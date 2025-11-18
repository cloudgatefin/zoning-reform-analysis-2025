// pdf-export.js - PDF export functionality using jsPDF and html2canvas

export class PDFExport {
  constructor() {
    this.isGenerating = false;
  }

  async generatePDF(summaryData, filteredData) {
    if (this.isGenerating) return;

    this.isGenerating = true;
    const btn = document.getElementById('downloadPDFBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '📄 Generating PDF...';
    }

    try {
      // Dynamically import jsPDF and html2canvas from CDN (loaded in HTML)
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // accent color
      doc.text('Zoning Reform Dashboard Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Summary Statistics
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Summary Statistics', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(`Total Reforms (OK windows): ${summaryData.reformsOk}`, 14, yPosition);
      yPosition += 6;

      const avgPct = summaryData.avgPct != null && Number.isFinite(summaryData.avgPct)
        ? summaryData.avgPct.toFixed(2) + '%'
        : 'N/A';
      doc.text(`Average Percent Change: ${avgPct}`, 14, yPosition);
      yPosition += 6;

      if (summaryData.range.earliest && summaryData.range.latest) {
        const dateRange = `${summaryData.range.earliest.toISOString().slice(0, 10)} to ${summaryData.range.latest.toISOString().slice(0, 10)}`;
        doc.text(`Effective Date Range: ${dateRange}`, 14, yPosition);
        yPosition += 6;
      }

      doc.text(`Filtered Records: ${filteredData.length}`, 14, yPosition);
      yPosition += 12;

      // Capture charts as images
      const charts = [
        { id: 'barChart', title: 'Percent Change by Jurisdiction' },
        { id: 'stateTrendChart', title: 'State Trend Analysis' }
      ];

      for (const chart of charts) {
        const canvas = document.getElementById(chart.id);
        if (canvas && yPosition < pageHeight - 80) {
          try {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 28;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;

            // Add title
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(chart.title, 14, yPosition);
            yPosition += 6;

            // Add image
            if (yPosition + imgHeight > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }

            doc.addImage(imgData, 'PNG', 14, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          } catch (err) {
            console.error(`Error capturing ${chart.id}:`, err);
          }
        }
      }

      // Capture map
      const mapWrapper = document.querySelector('.map-wrapper');
      if (mapWrapper && yPosition < pageHeight - 80) {
        try {
          doc.setFontSize(12);
          doc.setTextColor(0);

          if (yPosition + 100 > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text('Reform Impact Map', 14, yPosition);
          yPosition += 6;

          const mapCanvas = await html2canvas(mapWrapper, {
            backgroundColor: '#020617',
            scale: 2
          });

          const mapImgData = mapCanvas.toDataURL('image/png');
          const mapImgWidth = pageWidth - 28;
          const mapImgHeight = (mapCanvas.height / mapCanvas.width) * mapImgWidth;

          if (yPosition + mapImgHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          doc.addImage(mapImgData, 'PNG', 14, yPosition, mapImgWidth, mapImgHeight);
          yPosition += mapImgHeight + 10;
        } catch (err) {
          console.error('Error capturing map:', err);
        }
      }

      // Data table (first 20 rows)
      if (filteredData.length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.text('Reform Details (Top 20)', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(8);
        const tableData = filteredData.slice(0, 20).map(d => [
          d.jurisdiction || '',
          d.reform_name || '',
          d.reform_type || '',
          d.effective_date || '',
          d.percent_change != null && Number.isFinite(d.percent_change)
            ? d.percent_change.toFixed(2) + '%'
            : ''
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Jurisdiction', 'Reform', 'Type', 'Date', '% Change']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 }
        });
      }

      // Footer on last page
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`zoning-reform-report-${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      this.isGenerating = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = '📄 Download PDF Report';
      }
    }
  }
}
