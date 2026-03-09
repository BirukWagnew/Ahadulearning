import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (studentId, courseId, studentName, courseTitle) => {
  const certificatesDir = path.resolve(__dirname, '..', 'certificates');
  await fs.promises.mkdir(certificatesDir, { recursive: true });

  const logoCandidates = [
    path.resolve(__dirname, 'assets', 'ahadulearning-logo.png'),
    path.resolve(__dirname, 'assets', 'ahadulearning-image-logo.png'),
    path.resolve(__dirname, 'assets', 'logo.png'),
    path.resolve(__dirname, '..', 'assets', 'ahadulearning-logo.png'),
    path.resolve(__dirname, '..', 'assets', 'ahadulearning-image-logo.png'),
    path.resolve(__dirname, '..', 'assets', 'logo.png'),
  ];
  const logoPath = logoCandidates.find((p) => {
    try {
      return fs.existsSync(p) && fs.statSync(p).size > 0;
    } catch {
      return false;
    }
  });

  const safeStudentId = String(studentId);
  const safeCourseId = String(courseId);
  const fileName = `${safeStudentId}-${safeCourseId}-certificate.pdf`;
  const filePath = path.join(certificatesDir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const stream = fs.createWriteStream(filePath);

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.on('error', reject);

    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const teal = '#118ab2';
    const dark = '#0f172a';
    const muted = '#475569';
    const accent = '#0b77c5';
    const grayBar = '#cfd4d9';

    const border = 10; // thin border
    const inset = 16; // white padding inside border
    const innerOutline = 2;

    const innerX = border + inset;
    const innerY = border + inset;
    const innerW = pageWidth - (border + inset) * 2;
    const innerH = pageHeight - (border + inset) * 2;

    const contentLeft = innerX + 44;
    const contentRight = innerX + innerW - 44;
    const contentW = contentRight - contentLeft;
    const centerX = pageWidth / 2;

    // White page
    doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff');

    // Thick teal frame
    doc.save();
    doc.fillColor(teal);
    doc.rect(0, 0, pageWidth, border).fill(); // top
    doc.rect(0, pageHeight - border, pageWidth, border).fill(); // bottom
    doc.rect(0, 0, border, pageHeight).fill(); // left
    doc.rect(pageWidth - border, 0, border, pageHeight).fill(); // right
    doc.restore();

    // Thin inner outline
    doc.save();
    doc.lineWidth(innerOutline).strokeColor(teal);
    doc.rect(innerX, innerY, innerW, innerH).stroke();
    doc.restore();

    // Centered brand logo inside certificate (image if available, fallback to monogram)
    const titleTop = innerY + 58;
    if (logoPath) {
      try {
        doc.image(logoPath, centerX - 45, titleTop + 2, {
          fit: [90, 32],
          align: 'center',
          valign: 'top',
        });
      } catch {
        // fall back to monogram
        doc.save();
        doc.fillColor(accent);
        doc.circle(centerX, titleTop + 16, 14).fill();
        doc.fillColor('#ffffff').fontSize(18).text('A', centerX - 6, titleTop + 6, { width: 12, align: 'center' });
        doc.restore();
      }
    } else {
      doc.save();
      doc.fillColor(accent);
      doc.circle(centerX, titleTop + 16, 14).fill();
      doc.fillColor('#ffffff').fontSize(18).text('A', centerX - 6, titleTop + 6, { width: 12, align: 'center' });
      doc.restore();
    }

    doc.fillColor(dark).fontSize(14).text('Ahadu', 0, titleTop + 34, { align: 'center' });
    doc.fillColor(muted).fontSize(12).text('Learning', 0, titleTop + 52, { align: 'center' });

    doc.fillColor(dark).fontSize(18).text('CERTIFICATE OF COMPLETION', 0, titleTop + 82, { align: 'center' });

    const presentedTop = titleTop + 132;
    doc.fillColor(muted).fontSize(11).text('Presented to', 0, presentedTop, { align: 'center' });
    doc.fillColor(accent).fontSize(16).text(studentName || 'Student', 0, presentedTop + 22, { align: 'center' });

    const courseTop = presentedTop + 78;
    doc.fillColor(muted).fontSize(11).text('For successfully completing the course', 0, courseTop, { align: 'center' });
    doc.fillColor(accent).fontSize(13).text(courseTitle || 'Course', contentLeft, courseTop + 22, { width: contentW, align: 'center' });

    // Signature blocks (3) like reference
    const sigTop = innerY + innerH - 140;
    const barW = 150;
    const barH = 16;
    const gap = 36;
    const blockW = barW;
    const totalW = blockW * 3 + gap * 2;
    const startX = centerX - totalW / 2;

    const drawSigBlock = (x, name, role, showMonogram = false) => {
      doc.save();
      doc.fillColor(grayBar);
      doc.rect(x, sigTop, barW, barH).fill();
      doc.restore();

      if (showMonogram) {
        const monoX = x + barW - 26;
        const monoY = sigTop + 1;
        if (logoPath) {
          try {
            doc.image(logoPath, monoX, monoY, { fit: [24, 14] });
          } catch {
            const monoR = 7;
            const cx = x + barW - 14;
            const cy = sigTop + barH / 2;
            doc.save();
            doc.fillColor(accent);
            doc.circle(cx, cy, monoR).fill();
            doc.fillColor('#ffffff').fontSize(9).text('A', cx - 3.5, cy - 5.5, { width: 7, align: 'center' });
            doc.restore();
          }
        } else {
          const monoR = 7;
          const cx = x + barW - 14;
          const cy = sigTop + barH / 2;
          doc.save();
          doc.fillColor(accent);
          doc.circle(cx, cy, monoR).fill();
          doc.fillColor('#ffffff').fontSize(9).text('A', cx - 3.5, cy - 5.5, { width: 7, align: 'center' });
          doc.restore();
        }
      }

      doc.fillColor(dark).fontSize(9).text(name, x, sigTop + 22, { width: barW, align: 'center' });
      doc.fillColor(muted).fontSize(8).text(role, x, sigTop + 35, { width: barW, align: 'center' });
    };

    drawSigBlock(startX, 'Biruk Wagnew', 'CEO of AhaduLearning', true);
    drawSigBlock(startX + barW + gap, studentName || 'Student', 'Student');
    drawSigBlock(startX + (barW + gap) * 2, 'Kidus Workagenahu', 'Director', true);

    // Completion date
    const issueDate = new Date();
    const issueDateText = issueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fillColor(muted).fontSize(10).text(`Completed on ${issueDateText}`, 0, innerY + innerH - 58, { align: 'center' });

    doc.end();
  });

  // Return a relative URL that your static server can expose
  return `/certificates/${fileName}`;
};
