import { jsPDF } from 'jspdf';
import { TripItinerary, UserProfile } from '../types';
import { getDestinationWeatherInsight } from '../data/weatherData';
import { predictTourPrice } from './mlEngine';

export function exportItineraryToPDF(itinerary: TripItinerary, currentUser: UserProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Helper for page overflow
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderSmall();
    }
  };

  const drawHeaderSmall = () => {
    doc.setFillColor(7, 13, 25); // Deep midnight navy
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 216, 246); // Electric cyan
    doc.text('TRIPWISE AI • TRAVEL ITINERARY & CLIMATE INTELLIGENCE', margin, 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, 8);
    y = 18;
  };

  // 1. Header Banner
  doc.setFillColor(7, 13, 25); // Deep midnight oceanic navy
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent cyan line
  doc.setFillColor(0, 216, 246);
  doc.rect(0, 41, pageWidth, 1.5, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('TRIPWISE AI', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 216, 246);
  doc.text('NEXT-GEN TRAVEL INTELLIGENCE • ITINERARY & WEATHER ADVISORY', margin, 19);

  // Itinerary Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(itinerary.tripTitle, margin, 29);

  // Traveler & Date Subtext
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Traveler: ${currentUser.name}   |   Departure: ${itinerary.departureDate}   |   Generated: ${new Date().toLocaleDateString()}`,
    margin,
    36
  );

  y = 48;

  // 2. Metrics Summary Cards
  const totalDays = itinerary.items.reduce((sum, item) => sum + item.durationDays, 0);
  const totalBasePrice = itinerary.items.reduce((sum, item) => sum + item.package.base_price, 0);
  const totalEstimatedPrice = itinerary.items.reduce((sum, item) => {
    const pred = predictTourPrice({
      package_id: item.package.package_id,
      group_size: 2,
      lead_time_days: 30,
      travel_season: item.package.season_tag
    });
    return sum + pred.demandAdjustedEstimate;
  }, 0);

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 16;

  const stats = [
    { label: 'TOTAL DURATION', val: `${totalDays} Days` },
    { label: 'STOPS COUNT', val: `${itinerary.items.length} Cities` },
    { label: 'CATALOG PRICE', val: `Rs ${totalBasePrice.toLocaleString('en-IN')}` },
    { label: 'DEMAND ESTIMATE', val: `Rs ${totalEstimatedPrice.toLocaleString('en-IN')}` }
  ];

  stats.forEach((st, i) => {
    const cardX = margin + i * (cardWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label, cardX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(st.val, cardX + 3, y + 12);
  });

  y += cardHeight + 8;

  // 3. Section Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('CHRONOLOGICAL DESTINATIONS & WEATHER INSIGHTS', margin, y);
  y += 6;

  // 4. Loop through itinerary stops
  itinerary.items.forEach((item, index) => {
    const endDay = item.dayStart + item.durationDays - 1;
    const weather = getDestinationWeatherInsight(item.package.destination, item.package.season_tag, item.startDate);

    // Connecting transit banner
    if (item.transitInfo) {
      checkPageBreak(12);
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(67, 56, 202);
      doc.text(`CONNECTING TRANSIT: ${item.transitInfo.type.toUpperCase()}`, margin + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(79, 70, 229);
      doc.text(
        `${item.transitInfo.detail} (Est. ${item.transitInfo.duration})`,
        margin + 60,
        y + 5.5
      );
      y += 11;
    }

    // Stop Card
    const estimatedCardHeight = 44 + (item.package.highlights.length > 2 ? 6 : 0);
    checkPageBreak(estimatedCardHeight);

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, estimatedCardHeight, 2.5, 2.5, 'FD');

    // Left accent bar
    doc.setFillColor(0, 180, 216);
    doc.roundedRect(margin, y, 2.5, estimatedCardHeight, 1, 1, 'F');

    // Day & Destination Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `STOP ${index + 1}: ${item.package.destination.toUpperCase()} — ${item.package.title}`,
      margin + 6,
      y + 7
    );

    // Date & Duration pill text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Days ${item.dayStart}–${endDay} (${item.durationDays} Days)  |  Starts: ${item.startDate}  |  Category: ${item.package.category}`,
      margin + 6,
      y + 12.5
    );

    // Price tag on top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const priceStr = `Catalog: Rs ${item.package.base_price.toLocaleString('en-IN')}`;
    doc.text(priceStr, pageWidth - margin - doc.getTextWidth(priceStr) - 3, y + 7);

    // Weather Insight Box inside Stop Card
    doc.setFillColor(240, 253, 250); // Light cyan tint
    doc.setDrawColor(153, 246, 228);
    const wBoxY = y + 15.5;
    const wBoxH = 15;
    doc.roundedRect(margin + 6, wBoxY, pageWidth - margin * 2 - 12, wBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 118, 110);
    doc.text(`WEATHER INSIGHT: ${weather.climateType.toUpperCase()}`, margin + 9, wBoxY + 4.5);

    // Best Time & Timing Match
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(17, 94, 89);
    doc.text(
      `Best Time to Visit: ${weather.bestTimeToVisit}  |  Avg Temp: ${weather.avgTempRange}`,
      margin + 9,
      wBoxY + 9
    );

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(19, 78, 74);
    doc.text(
      `Advisory (${weather.timingStatus}): ${weather.timingAdvice.substring(0, 115)}...`,
      margin + 9,
      wBoxY + 13
    );

    // Highlights & Notes below Weather Box
    let subY = wBoxY + wBoxH + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('EXCURSIONS:', margin + 6, subY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const highlightsText = item.package.highlights.slice(0, 3).join(' • ');
    doc.text(highlightsText, margin + 28, subY);

    if (item.notes) {
      subY += 4.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('TRAVELER NOTES:', margin + 6, subY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(item.notes.substring(0, 95), margin + 35, subY);
    }

    y += estimatedCardHeight + 5;
  });

  // Footer on final page
  checkPageBreak(25);
  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TRIPWISE AI • TRANSPARENT MACHINE LEARNING DEMAND PRICING & WEATHER ADVISORY', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Pricing estimates generated via XGBoost Regression engine. Dynamic forecasts reflect seasonal lead times and historical demand.',
    margin,
    y + 4.5
  );

  // Save the PDF file to user device
  const safeTitle = itinerary.tripTitle.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeTitle}_Itinerary_TripWise.pdf`);
}
