import React from 'react';

/**
 * AdyapanOfferDocument Component
 * Renders an exact 4-Page Official Training Offer Letter for SR'S ADYAPAN EDUTECH PRIVATE LIMITED
 * Supports both on-screen display and pixel-perfect A4 printing / PDF export.
 */
const AdyapanOfferDocument = ({ data = {}, printMode = false }) => {
  const {
    olNo = 'ADP0428',
    offerDate = '14-May-2026',
    candidateName = 'Dinesh Kumar Sharma',
    duration = '6 MONTHS',
    jobTitle = 'COMMUNITY DEVELOPMENT INTERN',
    trainingStartDate = '25-May-2026',
    trainingEndDate = '06-Jun-2026',
    ojtStartDate = '07-Jun-2026',
    ojtEndDate = '07-Dec-2026',
    location = 'HYDERABAD',
    stipend = 'INR 20000/-PerMonth',
    incentives = 'Up to 10,000/- INCENTIVES.',
    postProbationCtc = '₹8 LPA ( 6 Fixed + 2 Variable )',
    reportingDate = '25-May-2026',
    unpaidDays = '12',
    stipendStartDay = '13th day',
    workingHours = '9 Hours a day (Inc. Lunch Break).',
    workTiming = '11AM - 8 PM.',
    jobType = 'Full Time Training',
    hrEmail = 'hr@adyapan.com',
    hrPhone = '8179124566',
    companyWebsite = 'www.adyapanschool.com',
    hrManagerName = 'HR MANAGER',
  } = data;

  // Header SVG Emblem Logo matching Adyapan branding
  const AdyapanLogo = () => (
    <div 
      className="w-16 h-16 rounded-full flex flex-col items-center justify-center p-1 border-2 border-orange-300 shrink-0 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
    >
      <span className="font-extrabold text-xl leading-none tracking-tighter text-slate-950">ady.</span>
      <span className="text-[7px] font-bold tracking-[0.2em] uppercase mt-0.5 text-slate-900 opacity-90">ADYAPAN</span>
    </div>
  );

  // Background Watermark emblem matching exact PDF watermark styling
  const PageWatermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
      <div 
        className="w-[440px] h-[440px] rounded-full flex flex-col items-center justify-center transform -rotate-12"
        style={{
          border: '22px solid rgba(251, 191, 36, 0.14)',
          backgroundColor: 'rgba(254, 243, 199, 0.08)',
        }}
      >
        <span 
          className="font-black text-9xl tracking-tighter select-none"
          style={{ color: 'rgba(217, 119, 6, 0.10)', fontFamily: 'sans-serif' }}
        >
          ady.
        </span>
        <span 
          className="font-bold text-2xl tracking-[0.4em] uppercase mt-2 select-none"
          style={{ color: 'rgba(180, 83, 9, 0.10)', fontFamily: 'sans-serif' }}
        >
          A D Y A P A N
        </span>
      </div>
    </div>
  );

  // Common Page Header
  const PageHeader = () => (
    <div className="relative z-10 w-full mb-6 pb-2 border-b-2 border-slate-700">
      <div className="flex items-center gap-4">
        <AdyapanLogo />
        <div className="flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-wide text-[#E58A00] font-sans uppercase">
            SR’S ADYAPAN EDUTECH PRIVATE LIMITED
          </h1>
          <h2 className="text-sm font-bold tracking-[0.4em] text-[#C00000] uppercase text-center mt-1">
            A D Y A P A N   S C H O O L.
          </h2>
        </div>
      </div>
    </div>
  );

  // Common Page Footer
  const PageFooter = () => (
    <div className="relative z-10 w-full mt-auto bg-[#D98200] text-white py-2 px-4 flex items-center justify-center text-xs font-semibold tracking-wider gap-6 shadow-inner">
      <span>{hrEmail}</span>
      <span>|</span>
      <span>{companyWebsite}</span>
      <span>|</span>
      <span>{hrPhone}</span>
    </div>
  );

  return (
    <div className={`adyapan-document-wrapper font-sans text-slate-900 bg-slate-100 ${printMode ? 'p-0 bg-white' : 'py-8 px-4'}`}>
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .adyapan-document-wrapper { padding: 0 !important; background: white !important; }
          .adyapan-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 296mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          .adyapan-page:last-child {
            page-break-after: auto !important;
          }
        }
      `}</style>

      {/* PAGE 1 */}
      <div className="adyapan-page relative bg-white w-[210mm] min-h-[297mm] mx-auto p-10 flex flex-col justify-between shadow-2xl mb-8 border border-slate-200 box-border text-[13.5px] leading-relaxed">
        <PageWatermark />
        <PageHeader />

        <div className="relative z-10 flex-1 flex flex-col space-y-6 pt-2">
          {/* Date & OL No */}
          <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
            <div>{offerDate}</div>
            <div>OL No: <span className="font-extrabold">{olNo}</span></div>
          </div>

          {/* Salutation */}
          <div className="text-base font-bold pt-2">
            Dear <span className="font-extrabold text-slate-900">{candidateName}</span> ,
          </div>

          {/* Opening Paragraph */}
          <p className="text-justify leading-relaxed">
            We congratulate you for being selected for a <strong className="font-bold text-slate-900">{duration}</strong> Training with adyapan. “At will basis” which can be extended. Please find the following confirmation of your Training :
          </p>

          {/* Job & Training Details Block */}
          <div className="space-y-2.5 pl-2 font-medium">
            <div className="flex items-baseline">
              <span className="font-bold w-48 text-slate-900">Job Title:</span>
              <span className="font-bold uppercase text-slate-900 tracking-wide">{jobTitle}</span>
            </div>

            <div className="flex items-baseline pt-2">
              <span className="font-bold w-48 text-slate-900">Training Start Date:</span>
              <span>{trainingStartDate}</span>
            </div>

            <div className="flex items-baseline">
              <span className="font-bold w-48 text-slate-900">Training End Date:</span>
              <span>{trainingEndDate}</span>
            </div>

            <div className="flex items-baseline pt-2">
              <span className="font-bold w-48 text-slate-900">OJT Start Date:</span>
              <span>{ojtStartDate}</span>
            </div>

            <div className="flex items-baseline">
              <span className="font-bold w-48 text-slate-900">OJT End Date:</span>
              <span>{ojtEndDate}</span>
            </div>

            <div className="flex items-baseline pt-2">
              <span className="font-bold w-48 text-slate-900">Location :</span>
              <span className="font-bold uppercase">{location}</span>
            </div>

            <div className="flex items-baseline pt-3">
              <span className="font-bold w-48 text-slate-900">Stipend:</span>
              <span className="font-extrabold text-slate-900">{stipend}</span>
            </div>

            <div className="pl-48 text-xs font-bold text-slate-800 tracking-wide">
              {incentives}
            </div>

            <div className="flex items-baseline pt-1">
              <span className="font-bold w-48 text-slate-900">Post-Probation CTC:</span>
              <span className="font-bold text-slate-900">{postProbationCtc}</span>
            </div>
          </div>

          {/* Unpaid Training Clause Notice */}
          <div className="pt-8">
            <p className="text-justify leading-relaxed">
              The first {unpaidDays} days of training are <strong className="font-bold text-slate-900">unpaid</strong>. Once these {unpaidDays} days are successfully completed, the trainee will start receiving the stipend <strong className="font-bold text-slate-900">from the {stipendStartDay}</strong>, subject to regular attendance and satisfactory performance.
            </p>
          </div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="adyapan-page relative bg-white w-[210mm] min-h-[297mm] mx-auto p-10 flex flex-col justify-between shadow-2xl mb-8 border border-slate-200 box-border text-[13.5px] leading-relaxed">
        <PageWatermark />
        <PageHeader />

        <div className="relative z-10 flex-1 flex flex-col space-y-12 pt-4">
          <p className="text-justify leading-relaxed">
            Please indicate your acceptance, by signing in the letter and mail the signed and scanned soft copy of the training Offer Letter and the documents as mentioned below to the <a href={`mailto:${hrEmail}`} className="text-blue-600 underline font-semibold">{hrEmail}</a> within <strong className="font-bold text-slate-900">2 working days from the receipt of this mail</strong>. The offer shall stand automatically withdrawn without further action on the part of <strong className="font-bold text-slate-900">adyapan if we do not receive your acceptance as per the mentioned timeline</strong>.
          </p>

          <div className="pt-16 pb-8 px-6 border border-dashed border-slate-300 rounded-lg bg-orange-50/20 text-center max-w-2xl mx-auto space-y-6">
            <p className="text-center font-medium leading-relaxed">
              I have read and understood the above terms and conditions and I accept this offer, as set forth above, with adyapan, and will report on or before <strong className="font-bold text-slate-900">{reportingDate}</strong>.
            </p>
          </div>

          <div className="pt-16 space-y-4 max-w-md">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-900 w-32">SIGNATURE:</span>
              <span className="text-slate-600 italic">(Candidate’s Signature)</span>
            </div>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="font-bold text-slate-900 w-32">DATE:</span>
              <span className="border-b border-slate-400 w-48 inline-block"></span>
            </div>
          </div>
        </div>

        <PageFooter />
      </div>

      {/* PAGE 3 */}
      <div className="adyapan-page relative bg-white w-[210mm] min-h-[297mm] mx-auto p-10 flex flex-col justify-between shadow-2xl mb-8 border border-slate-200 box-border text-[12.5px] leading-snug">
        <PageWatermark />
        <PageHeader />

        <div className="relative z-10 flex-1 flex flex-col space-y-3 pt-2 text-justify">
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>By accepting this training offer you agree to perform all responsibilities assigned to you with due care and diligence and in compliance with the management norms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>You are also required to substantially use all of your time and effort to perform these tasks during business hours and such reasonable additional time as may be necessary.</span>
            </li>
          </ul>

          {/* Working Details Card */}
          <div className="my-3 pl-8 py-2 space-y-1.5 font-medium border-l-2 border-orange-500">
            <div><strong className="font-bold text-slate-900">Working Hours:</strong> {workingHours}</div>
            <div><strong className="font-bold text-slate-900">Work Timing:</strong> {workTiming}</div>
            <div><strong className="font-bold text-slate-900">Job Type:</strong> {jobType}</div>
            <div><strong className="font-bold text-slate-900">Location:</strong> {location}</div>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>As a Trainee you will not receive any of the employee benefits that regular employees receive.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>During the Training period, the company will have all the rights to terminate your services without offering any reason and you are required to give 15 Days notice should you wish to terminate your training before the end of your tenure.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>At any time if you wish to discontinue the training due to personal reasons , you will have to pay a compensation equal to 1 month stipend or you will have to serve 1 month notice period.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>All the information acquired during the course shall be strictly confidential and you shall refrain from using it for your own purpose or from disclosing it to anyone outside of the Company.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>Upon conclusion of your tenure, you will immediately return to the Company all of its property, equipment and documents including electronically stored information.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>You will observe all policies and practices governing the conduct of our business and employees.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>Official communication either within the company or outside the company should be through the company Email of your manager only.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black text-slate-800 text-sm leading-none mt-1">▪</span>
              <span>Post successful completion of the tenure, the candidate will be prone to performance based pre-placement offers by the company.</span>
            </li>
          </ul>

          <div className="pt-6 space-y-3 max-w-md">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-900 w-32">SIGNATURE:</span>
              <span className="text-slate-600 italic">(Candidate’s Signature)</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-bold text-slate-900 w-32">DATE:</span>
              <span className="border-b border-slate-400 w-48 inline-block"></span>
            </div>
          </div>
        </div>

        <PageFooter />
      </div>

      {/* PAGE 4 */}
      <div className="adyapan-page relative bg-white w-[210mm] min-h-[297mm] mx-auto p-10 flex flex-col justify-between shadow-2xl border border-slate-200 box-border text-[13px] leading-relaxed">
        <PageWatermark />
        <PageHeader />

        <div className="relative z-10 flex-1 flex flex-col space-y-8 pt-4">
          {/* Title */}
          <h2 className="text-center font-bold text-base tracking-widest uppercase text-slate-900 text-decoration">
            ANNEXURE
          </h2>

          {/* Table of Particulars */}
          <table className="w-full border-collapse border border-slate-800 text-left text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-800">
                <th className="border-r border-slate-800 p-2.5 font-bold w-16 text-center">Sl. No</th>
                <th className="p-2.5 font-bold">Particulars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="border-r border-slate-800 p-3 align-top font-bold text-center">1.</td>
                <td className="p-3 space-y-1">
                  <div className="font-medium text-slate-900">
                    Professional / Educational Certificates and Mark Sheets towards:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-800 pt-1">
                    <li>10th standard or equivalent examination (Original MS for Verification)</li>
                    <li>12th standard or equivalent examination (Original MS for Verification)</li>
                    <li>Graduation</li>
                    <li>Post-graduation / Doctorate</li>
                  </ul>
                  <div className="pt-1 font-normal text-slate-700">
                    Other relevant educational or skill certifications
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border-r border-slate-800 p-3 align-top font-bold text-center">2.</td>
                <td className="p-3 font-semibold text-slate-900 uppercase">
                  COLOR SCANNED COPY OF YOUR PHOTOGRAPHS
                </td>
              </tr>
              <tr>
                <td className="border-r border-slate-800 p-3 align-top font-bold text-center">3.</td>
                <td className="p-3 font-medium text-slate-900">
                  PAN Card, Voter ID or Driving Licence Scanned Copy.
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bank Account Details */}
          <div className="pt-2">
            <p className="font-semibold text-slate-900 leading-relaxed">
              4. Bank Account Details: Bank Name, Your Name as per Bank records, Account Number, IFSC Code.
            </p>
          </div>

          {/* HR Manager Signature */}
          <div className="pt-24 space-y-1">
            <div className="font-bold text-slate-900 mb-6">SIGNATURE:</div>
            <div className="font-bold text-slate-900 tracking-wide uppercase">{hrManagerName}</div>
            <div className="font-bold text-slate-900 tracking-wider uppercase">ADYAPAN</div>
          </div>
        </div>

        <PageFooter />
      </div>
    </div>
  );
};

export default AdyapanOfferDocument;
