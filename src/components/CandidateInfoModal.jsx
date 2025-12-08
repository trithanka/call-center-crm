import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { toast } from "react-toastify";
import {
  LuX,
  LuExternalLink,
  LuInfo,
  LuCircleAlert,
  LuFile,
  LuDownload,
  LuChevronDown,
  LuFileText,
} from "react-icons/lu";

const CandidateInfoModal = ({ isOpen, onClose, userId, userType = "Candidate" }) => {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchCandidateData();
    } else {
      setCandidateData(null);
      setOpenAccordions({});
    }
  }, [isOpen, userId]);

  // Load PDF.js library
  useEffect(() => {
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      // Set worker source
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    };
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[src*="pdf.min.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Load and render PDF when URL changes
  useEffect(() => {
    if (pdfPreviewUrl && pdfPreviewUrl.toLowerCase().endsWith('.pdf') && showPdfPreview) {
      loadPdf();
    } else {
      setPdfPages([]);
      setPdfDoc(null);
      setCurrentPage(1);
      setTotalPages(0);
      setPdfError(false);
    }
  }, [pdfPreviewUrl, showPdfPreview]);

  const loadPdf = async () => {
    // Wait for PDF.js to load
    let retries = 0;
    while (!window.pdfjsLib && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (!window.pdfjsLib) {
      setPdfError(true);
      setPdfLoading(false);
      return;
    }

    setPdfLoading(true);
    setPdfError(false);
    
    try {
      let pdf;
      
      // Try to fetch PDF as array buffer first
      try {
        const response = await fetch(pdfPreviewUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
      } catch (fetchError) {
        // If fetch fails (CORS), try loading directly from URL
        console.warn('Fetch failed, trying direct URL:', fetchError);
        const loadingTask = window.pdfjsLib.getDocument({ url: pdfPreviewUrl });
        pdf = await loadingTask.promise;
      }
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render first page
      await renderPage(pdf, 1);
      
      setPdfLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPdfError(true);
      setPdfLoading(false);
    }
  };

  const renderPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Update pages array
      setPdfPages(prev => {
        const newPages = [...prev];
        newPages[pageNum - 1] = canvas.toDataURL();
        return newPages;
      });
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
    
    // If page not rendered yet, render it
    if (!pdfPages[newPage - 1] && pdfDoc) {
      await renderPage(pdfDoc, newPage);
    }
  };

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserDataById(userId, userType);
      
      if (response && response.message === "Fetched Successfully!" && response.data) {
        // Handle Training Center data structure (has userData array)
        if (userType === "TrainingCenter" && response.data.userData && Array.isArray(response.data.userData)) {
          // Transform Training Center data to match expected structure
          setCandidateData({ trainingCenter: response.data.userData[0] });
        } else if (userType === "TrainingPartner" && response.data.tp && Array.isArray(response.data.tp)) {
          // Transform Training Partner data to match expected structure
          setCandidateData({ 
            trainingPartner: response.data.tp[0],
            tcDetails: response.data.tcDetails || []
          });
        } else if (userType === "Trainer" && response.data.userData && Array.isArray(response.data.userData)) {
          // Transform Trainer data to match expected structure
          setCandidateData({ trainer: response.data.userData[0] });
        } else {
          setCandidateData(response.data);
        }
      } else {
        const entityName = userType === "TrainingCenter" ? "training center" : 
                          userType === "TrainingPartner" ? "training partner" :
                          userType === "Trainer" ? "trainer" : "candidate";
        toast.error(`Failed to fetch ${entityName} details`);
        onClose();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const entityName = userType === "TrainingCenter" ? "training center" : 
                        userType === "TrainingPartner" ? "training partner" :
                        userType === "Trainer" ? "trainer" : "candidate";
      toast.error(`Failed to fetch ${entityName} details`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (section) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle DD/MM/YYYY format
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const handlePdfClick = (url) => {
    if (!url) return;
    
    // Add base URL if not already present
    let fullUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // Remove leading slash if present
      const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
      // Check if URL already contains the domain
      if (!cleanUrl.includes("ds1.skillmissionassam.org")) {
        fullUrl = `https://ds1.skillmissionassam.org/${cleanUrl}`;
      } else {
        fullUrl = `https://${cleanUrl}`;
      }
    }
    
    setPdfPreviewUrl(fullUrl);
    setShowPdfPreview(true);
    setPdfError(false);
    setPdfLoading(false);
    setPdfPages([]);
    setCurrentPage(1);
    setTotalPages(0);
    
    // If it's not a PDF, we'll show it as an image
    // PDF.js will handle PDFs, images will be shown directly
  };


  if (!isOpen) return null;

  // Handle Training Center, Training Partner, and Trainer data
  const trainingCenter = candidateData?.trainingCenter;
  const trainingPartner = candidateData?.trainingPartner;
  const trainer = candidateData?.trainer;
  const tcDetails = candidateData?.tcDetails || [];
  const isTrainingCenter = userType === "TrainingCenter";
  const isTrainingPartner = userType === "TrainingPartner";
  const isTrainer = userType === "Trainer";

  // Candidate data structure
  const basic = candidateData?.basic?.[0];
  const address = candidateData?.address || [];
  const family = candidateData?.family || [];
  const contact = candidateData?.contact?.[0];
  const bank = candidateData?.bank?.[0];
  const identity = candidateData?.identity || [];
  const qualification = candidateData?.qualification || [];
  const employmentDetail = candidateData?.employmentDetail?.[0];
  const disabilityDetail = candidateData?.disabilityDetail?.[0];
  const trainingDetail = candidateData?.trainingDetail?.[0];
  const batchDetail = candidateData?.batchDetail || [];
  const assessmentDetails = candidateData?.assessmentDetails || [];
  const centerDetail = candidateData?.centerDetail?.[0];
  const placementDetails = candidateData?.placementDetails || [];
  const trackingDetails = candidateData?.trackingDetails?.[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-emerald-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {isTrainingCenter ? "Training Center Information" : 
               isTrainingPartner ? "Training Partner Information" : 
               isTrainer ? "Trainer Information" :
               "Candidate Information"}
            </h3>
            {isTrainingCenter && trainingCenter && (
              <p className="text-sm text-gray-600 mt-1">
                {trainingCenter["TC Name"]} (Code: {trainingCenter["TC Code"]})
              </p>
            )}
            {isTrainingPartner && trainingPartner && (
              <p className="text-sm text-gray-600 mt-1">
                {trainingPartner.parentEntityName} (Code: {trainingPartner.tpCode})
              </p>
            )}
            {isTrainer && trainer && (
              <p className="text-sm text-gray-600 mt-1">
                {trainer.name} (ID: {trainer.Id})
              </p>
            )}
            {!isTrainingCenter && !isTrainingPartner && !isTrainer && basic && (
              <p className="text-sm text-gray-600 mt-1">
                {basic.certName} (ID: {basic.candidateId})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">
                Loading {isTrainingCenter ? "training center" : 
                        isTrainingPartner ? "training partner" : 
                        isTrainer ? "trainer" :
                        "candidate"} details...
              </span>
            </div>
          ) : candidateData ? (
            <div className="space-y-3">
              {/* Training Partner Information */}
              {isTrainingPartner && trainingPartner ? (
                <>
                  {/* Basic Training Partner Information */}
                  <AccordionSection
                    title="Basic Information"
                    isOpen={openAccordions.basic}
                    onToggle={() => toggleAccordion("basic")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="TP Code" value={trainingPartner.tpCode} />
                      <InfoField label="TP Name" value={trainingPartner.parentEntityName} />
                      <InfoField label="TP ID" value={trainingPartner.tpId} />
                      <InfoField label="Organization Type" value={trainingPartner.orgType} />
                      <InfoField label="SPOC Name" value={trainingPartner.spocName} />
                      <InfoField label="SPOC Mobile" value={trainingPartner.spocMobile} />
                      <InfoField label="SPOC Email" value={trainingPartner.spocEmail} />
                      <InfoField label="PAN" value={trainingPartner.pan} />
                    </div>
                  </AccordionSection>

                  {/* Address Information */}
                  <AccordionSection
                    title="Address Information"
                    isOpen={openAccordions.address}
                    onToggle={() => toggleAccordion("address")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="Address" value={trainingPartner.parentAddress || trainingPartner.address} colSpan={2} />
                      <InfoField label="Landmark" value={trainingPartner.landmark || "N/A"} />
                      <InfoField label="City" value={trainingPartner.city || "N/A"} />
                      <InfoField label="Village" value={trainingPartner.village || "N/A"} />
                      <InfoField label="Suburb" value={trainingPartner.suburb || "N/A"} />
                      <InfoField label="Panchayat" value={trainingPartner.panchayat || "N/A"} />
                      <InfoField label="State" value={trainingPartner.stateName} />
                      <InfoField label="District" value={trainingPartner.districtName} />
                      <InfoField label="Taluka" value={trainingPartner.talukaName || "N/A"} />
                      <InfoField label="ULB" value={trainingPartner.ulbName || "N/A"} />
                      <InfoField label="Pin Code" value={trainingPartner.pinCode || trainingPartner.pin} />
                      <InfoField label="Area Type" value={trainingPartner.areaType || "N/A"} />
                    </div>
                  </AccordionSection>

                  {/* Document Information */}
                  <AccordionSection
                    title="Document Information"
                    isOpen={openAccordions.documents}
                    onToggle={() => toggleAccordion("documents")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <UrlField 
                        label="Legal Document" 
                        url={trainingPartner.legalDocPath} 
                        onClick={() => handlePdfClick(trainingPartner.legalDocPath)}
                      />
                      <UrlField 
                        label="PAN Document" 
                        url={trainingPartner.panDocPath} 
                        onClick={() => handlePdfClick(trainingPartner.panDocPath)}
                      />
                    </div>
                  </AccordionSection>

                  {/* Training Centers List */}
                  <AccordionSection
                    title={`Training Centers (${tcDetails.length})`}
                    isOpen={openAccordions.tcDetails}
                    onToggle={() => toggleAccordion("tcDetails")}
                  >
                    {tcDetails.length > 0 ? (
                      <div className="space-y-3">
                        {tcDetails.map((tc, index) => (
                          <div key={tc.centerId || index} className="border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <InfoField label="Center Code" value={tc.centerCode} />
                              <InfoField label="Center Name" value={tc.centerName} />
                              <InfoField label="District" value={tc.districtName} />
                              <InfoField label="Center Status" value={tc.centerStatus} />
                              <InfoField label="SPOC Name" value={tc.spocName} />
                              <InfoField label="Center Mobile" value={tc.centerMobile} />
                              <InfoField label="Center Email" value={tc.centerEmail} colSpan={2} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No training centers available</p>
                    )}
                  </AccordionSection>
                </>
              ) : isTrainer && trainer ? (
                <>
                  {/* Basic Trainer Information */}
                  <AccordionSection
                    title="Basic Information"
                    isOpen={openAccordions.basic}
                    onToggle={() => toggleAccordion("basic")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="Trainer ID" value={trainer.Id} />
                      <InfoField label="Name" value={trainer.name} />
                      <InfoField label="Date of Birth" value={trainer.dob ? formatDate(trainer.dob) : "N/A"} />
                      <InfoField label="Gender" value={trainer.gender} />
                      <InfoField label="Qualification" value={trainer.qualification} />
                      <InfoField label="Mobile" value={trainer.mobile} />
                      <InfoField label="Email" value={trainer.emailId || "N/A"} />
                      <InfoField label="Status" value={trainer.status} />
                      <InfoField label="Approved Date" value={trainer.approvedDate ? formatDate(trainer.approvedDate) : "N/A"} />
                    </div>
                  </AccordionSection>

                  {/* Training Center Information */}
                  <AccordionSection
                    title="Training Center Information"
                    isOpen={openAccordions.tcInfo}
                    onToggle={() => toggleAccordion("tcInfo")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="TC ID" value={trainer.tcId} />
                      <InfoField label="TC Name" value={trainer.tcName} />
                      <InfoField label="TC Code" value={trainer.tcCode} />
                      <InfoField label="TC District" value={trainer.tc_dist} />
                      <InfoField label="TC Mobile" value={trainer.tc_mobile} />
                      <InfoField label="TC Email" value={trainer.tc_mail || "N/A"} />
                      <InfoField label="TC Address" value={trainer.tc_address} colSpan={2} />
                    </div>
                  </AccordionSection>
                </>
              ) : isTrainingCenter && trainingCenter ? (
                <>
                  {/* Basic Training Center Information */}
                  <AccordionSection
                    title="Basic Information"
                    isOpen={openAccordions.basic}
                    onToggle={() => toggleAccordion("basic")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="TP Code" value={trainingCenter["TP Code"]} />
                      <InfoField label="TP Name" value={trainingCenter["TP Name"]} />
                      <InfoField label="TC Code" value={trainingCenter["TC Code"]} />
                      <InfoField label="TC Name" value={trainingCenter["TC Name"]} />
                      <InfoField label="TC SPOC Name" value={trainingCenter["TC SPOC Name"]} />
                      <InfoField label="TC SPOC Mobile" value={trainingCenter["TC SPOC Mobile"]} />
                      <InfoField label="TC SPOC Email" value={trainingCenter["TC SPOC Email"]} />
                      <InfoField label="TC Login Status" value={trainingCenter["TC Login Status"]} />
                      <InfoField label="File Index" value={trainingCenter["File Index"]} />
                    </div>
                  </AccordionSection>

                  {/* Address Information */}
                  <AccordionSection
                    title="Address Information"
                    isOpen={openAccordions.address}
                    onToggle={() => toggleAccordion("address")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="TC Address" value={trainingCenter["TC Address"]} colSpan={2} />
                      <InfoField label="City/Village" value={trainingCenter["City/Village"]} />
                      <InfoField label="Post Office" value={trainingCenter["TC Post Office"]} />
                      <InfoField label="Pin Code" value={trainingCenter["TC Pin Code"]} />
                      <InfoField label="State" value={trainingCenter["TC State"]} />
                      <InfoField label="District" value={trainingCenter["TC District"]} />
                      <InfoField label="Block" value={trainingCenter["TC Block"]} />
                      <InfoField label="ULB" value={trainingCenter["TC ULB"] || "N/A"} />
                      <InfoField label="Police Station" value={trainingCenter["Police Station"]} />
                      <InfoField label="Loksabha Constituency" value={trainingCenter["TC Loksabha Constituency"]} />
                      <InfoField label="Assembly Constituency" value={trainingCenter["TC Assembly Constituency"]} />
                      <InfoField label="Longitude" value={trainingCenter["Longitude"]} />
                      <InfoField label="Latitude" value={trainingCenter["Latitude"]} />
                    </div>
                  </AccordionSection>

                  {/* File Hierarchy Information */}
                  <AccordionSection
                    title="File Hierarchy"
                    isOpen={openAccordions.fileHierarchy}
                    onToggle={() => toggleAccordion("fileHierarchy")}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField label="File Supervisor" value={trainingCenter["File Supervisor1, File Supervisor2"] || "N/A"} />
                      <InfoField label="DPMT" value={trainingCenter["DPMT 1, DPMT 2"] || "N/A"} />
                      <InfoField label="File Lead" value={trainingCenter["File Lead 1, File Lead 2"] || "N/A"} />
                    </div>
                  </AccordionSection>
                </>
              ) : (
                <>
              {/* Basic Information */}
              <AccordionSection
                title="Basic Information"
                isOpen={openAccordions.basic}
                onToggle={() => toggleAccordion("basic")}
              >
                {basic && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoField label="First Name" value={basic.fName} />
                    <InfoField label="Middle Name" value={basic.mName || "N/A"} />
                    <InfoField label="Last Name" value={basic.lName} />
                    <InfoField label="Certificate Name" value={basic.certName} />
                    <InfoField label="Date of Birth" value={formatDate(basic.dob)} />
                    <InfoField label="Gender" value={basic.gender} />
                    <InfoField label="Marital Status" value={basic.maritalStatus} />
                    <InfoField label="Mother Tongue" value={basic.motherTounge} />
                    <InfoField label="Religion" value={basic.religion} />
                    <InfoField label="Family Income" value={basic.familyIncome ? `₹${basic.familyIncome}` : "N/A"} />
                    <InfoField label="Father Name" value={basic.fatherName} />
                    <InfoField label="Mother Name" value={basic.motherName} />
                    <InfoField label="Caste Category" value={basic.casteName} />
                    <InfoField label="Status" value={basic.STATUS} />
                    <InfoField label="Identification Mark 1" value={basic.identificationMark1} />
                    <InfoField label="Identification Mark 2" value={basic.identificationMark2} />
                  </div>
                )}
              </AccordionSection>

              {/* Address Information */}
              <AccordionSection
                title={`Address Information (${address.length})`}
                isOpen={openAccordions.address}
                onToggle={() => toggleAccordion("address")}
              >
                {address.length > 0 ? (
                  <div className="space-y-4">
                    {address.map((addr, index) => (
                      <div key={addr.addressId || index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-2">{addr.addressType}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <InfoField label="Address" value={addr.address} />
                          <InfoField label="City" value={addr.cityName} />
                          <InfoField label="District" value={addr.district} />
                          <InfoField label="Taluka" value={addr.taluka} />
                          <InfoField label="State" value={addr.state} />
                          <InfoField label="Country" value={addr.country} />
                          <InfoField label="Post Office" value={addr.postOffice} />
                          <InfoField label="Pincode" value={addr.pincode} />
                          <InfoField label="Area Type" value={addr.areaType} />
                          <InfoField label="Correspondence" value={addr.correspondence ? "Yes" : "No"} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No address information available</p>
                )}
              </AccordionSection>

              {/* Family Information */}
              <AccordionSection
                title={`Family Information (${family.length})`}
                isOpen={openAccordions.family}
                onToggle={() => toggleAccordion("family")}
              >
                {family.length > 0 ? (
                  <div className="space-y-3">
                    {family.map((member, index) => (
                      <div key={member.familyId || index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <InfoField label="Relationship" value={member.relationshipName} />
                          <InfoField label="Name" value={member.name} />
                          <InfoField label="Gender" value={member.gender} />
                          <InfoField label="Age" value={member.age || "N/A"} />
                          <InfoField label="Marital Status" value={member.maritalStatus} />
                          <InfoField label="Income Source" value={member.incomeSourceName || "N/A"} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No family information available</p>
                )}
              </AccordionSection>

              {/* Contact Information */}
              <AccordionSection
                title="Contact Information"
                isOpen={openAccordions.contact}
                onToggle={() => toggleAccordion("contact")}
              >
                {contact && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoField label="Primary Contact" value={contact.primaryContactNo} />
                    <InfoField label="Other Contact" value={contact.otherContactNo || "N/A"} />
                    <InfoField label="Email" value={contact.email || "N/A"} />
                    <InfoField label="Telephone" value={contact.telephone || "N/A"} />
                  </div>
                )}
              </AccordionSection>

              

              {/* Qualification Information */}
              <AccordionSection
                title={`Qualification (${qualification.length})`}
                isOpen={openAccordions.qualification}
                onToggle={() => toggleAccordion("qualification")}
              >
                {qualification.length > 0 ? (
                  <div className="space-y-3">
                    {qualification.map((qual, index) => (
                      <div key={qual.candidateQualificationId || index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <InfoField label="Category" value={qual.categoryName} />
                          <InfoField label="Qualification" value={qual.qualificationName} />
                          <InfoField label="Year" value={qual.YEAR} />
                          <InfoField label="Stream" value={qual.stream || "N/A"} />
                          <InfoField label="Roll Number" value={qual.rollNo || "N/A"} />
                          <InfoField label="Grade" value={qual.grade || "N/A"} />
                          <InfoField label="School Name" value={qual.schoolName || "N/A"} />
                          <InfoField label="College Name" value={qual.collegeName || "N/A"} />
                          <InfoField label="Board/University" value={qual.schoolBoardName || qual.universityName || "N/A"} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No qualification information available</p>
                )}
              </AccordionSection>

              {/* Employment Information */}
              <AccordionSection
                title="Employment Information"
                isOpen={openAccordions.employment}
                onToggle={() => toggleAccordion("employment")}
              >
                {employmentDetail ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoField label="Employment Status" value={employmentDetail.employmentStatus} />
                    <InfoField label="Experience" value={employmentDetail.experiences || "N/A"} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No employment information available</p>
                )}
              </AccordionSection>

              {/* Disability Information */}
              <AccordionSection
                title="Disability Information"
                isOpen={openAccordions.disability}
                onToggle={() => toggleAccordion("disability")}
              >
                {disabilityDetail ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoField label="Has Disability" value={disabilityDetail.isDisability === "1" ? "Yes" : "No"} />
                    <InfoField label="Disabilities" value={disabilityDetail.disabilities || "N/A"} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No disability information available</p>
                )}
              </AccordionSection>

              {/* Training Information */}
              <AccordionSection
                title="Training Information"
                isOpen={openAccordions.training}
                onToggle={() => toggleAccordion("training")}
              >
                {trainingDetail && trainingDetail.trainings ? (
                  <div className="text-sm">
                    {(() => {
                      try {
                        const trainings = JSON.parse(trainingDetail.trainings);
                        return Array.isArray(trainings) ? (
                          <div className="space-y-3">
                            {trainings.map((training, index) => (
                              <div key={`training-${training.courseName}-${training.courseYear}-${index}`} className="border border-gray-200 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <InfoField label="Training Sector" value={training.trainingSector} />
                                  <InfoField label="Course Name" value={training.courseName} />
                                  <InfoField label="Course Year" value={training.courseYear} />
                                  <InfoField label="Course Duration" value={training.courseDuration ? `${training.courseDuration} days` : "N/A"} />
                                  <InfoField label="Course Prescriber" value={training.coursePrescriber} />
                                  <InfoField label="Training Funded By" value={training.trainingFunded} />
                                  <InfoField label="Certificate Received" value={training.isCertificateReceived} />
                                  <InfoField label="Certifying Authority" value={training.certifyingAuthority} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Invalid training data format</p>
                        );
                      } catch (error) {
                        return <p className="text-sm text-gray-500">Error parsing training data</p>;
                      }
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No training information available</p>
                )}
              </AccordionSection>

              {/* Batch Information */}
              <AccordionSection
                title={`Batch Information (${batchDetail.length})`}
                isOpen={openAccordions.batch}
                onToggle={() => toggleAccordion("batch")}
              >
                {batchDetail.length > 0 ? (
                  <div className="space-y-3">
                    {batchDetail.map((batch, index) => (
                      <div key={batch.batchId || index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <InfoField label="Batch ID" value={batch.batchId} />
                          <InfoField label="Batch Status" value={batch.batchStatus} />
                          <InfoField label="Start Date" value={formatDate(batch.startDate)} />
                          <InfoField label="End Date" value={formatDate(batch.endDate)} />
                          <InfoField label="Start Time" value={batch.startTime} />
                          <InfoField label="End Time" value={batch.endTime} />
                          <InfoField label="Sector Name" value={batch.sectorName} />
                          <InfoField label="Course Code" value={batch.courseCode} />
                          <InfoField label="Course Name" value={batch.courseName} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No batch information available</p>
                )}
              </AccordionSection>

              {/* Assessment Information */}
              <AccordionSection
                title={`Assessment Information (${assessmentDetails.length})`}
                isOpen={openAccordions.assessment}
                onToggle={() => toggleAccordion("assessment")}
              >
                {assessmentDetails.length > 0 ? (
                  <div className="space-y-4">
                    {assessmentDetails.map((assessment, index) => {
                      // Determine attempt number - first one is attempt 1, second is attempt 2
                      const attempt = index + 1;
                      const isReassessment = attempt === 2;
                      const attemptLabel = isReassessment ? "Reassessment" : "Assessment";
                      
                      return (
                        <div key={assessment.BatchId || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Attempt {attempt}
                            </span>
                            <span className="text-gray-600">{attemptLabel}</span>
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <InfoField label="Assessment Date" value={assessment.assessmentDate ? formatDate(assessment.assessmentDate) : "N/A"} />
                            <InfoField label="Marks" value={assessment.marks !== null && assessment.marks !== undefined ? assessment.marks : "N/A"} />
                            <InfoField label="Result Date" value={assessment.resultDate ? formatDate(assessment.resultDate) : "N/A"} />
                            <InfoField 
                              label="Result" 
                              value={
                                <span className={`font-semibold ${
                                  assessment.result === "Passed" ? "text-green-600" : 
                                  assessment.result === "Failed" ? "text-red-600" : 
                                  "text-gray-900"
                                }`}>
                                  {assessment.result || "N/A"}
                                </span>
                              } 
                            />
                            <UrlField 
                              label="Certificate" 
                              url={assessment.certificate} 
                              onClick={() => handlePdfClick(assessment.certificate)}
                            />
                            <UrlField 
                              label="Marksheet" 
                              url={assessment.marksheet} 
                              onClick={() => handlePdfClick(assessment.marksheet)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No assessment information available</p>
                )}
              </AccordionSection>

              {/* Center Information */}
              <AccordionSection
                title="Center Information"
                isOpen={openAccordions.center}
                onToggle={() => toggleAccordion("center")}
              >
                {centerDetail ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoField label="Center ID" value={centerDetail.centerId} />
                    <InfoField label="Center Code" value={centerDetail.centerCode} />
                    <InfoField label="Center Name" value={centerDetail.centerName} />
                    <InfoField label="District" value={centerDetail.centerDistrict} />
                    <InfoField label="ULB" value={centerDetail.centerULB || "N/A"} />
                    <InfoField label="Taluka" value={centerDetail.centerTaluka || "N/A"} />
                    <InfoField label="Address" value={centerDetail.centerAddress} colSpan={2} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No center information available</p>
                )}
              </AccordionSection>

              {/* Placement Information */}
              <AccordionSection
                title={`Placement Information (${placementDetails.length})`}
                isOpen={openAccordions.placement}
                onToggle={() => toggleAccordion("placement")}
              >
                {placementDetails.length > 0 ? (
                  <div className="space-y-3">
                    {placementDetails.map((placement, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <InfoField label="Employer Name" value={placement.employerName || "N/A"} />
                          <InfoField label="Salary" value={placement.salary ? `₹${placement.salary}` : "N/A"} />
                          <InfoField label="Placement Date" value={placement.placementDate ? formatDate(placement.placementDate) : "N/A"} />
                          <InfoField label="Placement Type" value={placement.placementType || "N/A"} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No placement information available</p>
                )}
              </AccordionSection>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No {isTrainingCenter ? "training center" : 
                  isTrainingPartner ? "training partner" : 
                  isTrainer ? "trainer" :
                  "candidate"} data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && pdfPreviewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* PDF Preview Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                {pdfPreviewUrl.toLowerCase().endsWith('.pdf') ? 'PDF Preview' : 'Document Preview'}
              </h3>
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setPdfPreviewUrl(null);
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                <LuX className="w-6 h-6" />
              </button>
            </div>

            {/* PDF Preview Content */}
            <div className="flex-1 overflow-auto bg-gray-100 relative">
              {pdfPreviewUrl.toLowerCase().endsWith('.pdf') || pdfPreviewUrl.toLowerCase().match(/\.(pdf)$/i) ? (
                <>
                  {pdfLoading ? (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  ) : pdfError ? (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <LuCircleAlert className="w-14 h-14 text-red-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Unable to Load PDF</h4>
                      <p className="text-sm text-gray-600 mb-2 text-center max-w-md">
                        The PDF could not be loaded. This may be due to CORS restrictions or network issues.
                      </p>
                      <p className="text-xs text-gray-500 mb-6 text-center">
                        Please try opening the document directly in a new tab.
                      </p>
                      <div className="flex gap-3">
                        <a
                          href={pdfPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <LuExternalLink className="w-5 h-5" />
                          Open in New Tab
                        </a>
                        <a
                          href={pdfPreviewUrl}
                          download
                          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <LuDownload className="w-5 h-5" />
                          Download
                        </a>
                      </div>
                    </div>
                  ) : pdfPages.length > 0 ? (
                    <div className="p-4">
                      {/* Page Navigation */}
                      {totalPages > 1 && (
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 mb-4 flex items-center justify-between z-10 shadow-sm">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-700 font-medium">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            Next
                          </button>
                        </div>
                      )}
                      
                      {/* PDF Page Display */}
                      <div className="flex justify-center">
                        {pdfPages[currentPage - 1] ? (
                          <img
                            src={pdfPages[currentPage - 1]}
                            alt={`PDF Page ${currentPage}`}
                            className="max-w-full h-auto shadow-lg rounded"
                            style={{ maxHeight: 'calc(90vh - 200px)' }}
                          />
                        ) : (
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 mt-4 flex items-center justify-end gap-3 z-10">
                        <a
                          href={pdfPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <LuExternalLink className="w-4 h-4" />
                          Open in New Tab
                        </a>
                        <a
                          href={pdfPreviewUrl}
                          download
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <LuDownload className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Preparing PDF preview...</p>
                    </div>
                  )}
                </>
              ) : (
                // Handle image files (jpg, jpeg, png, etc.)
                pdfPreviewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="max-w-full max-h-[calc(90vh-150px)] overflow-auto bg-white rounded-lg shadow-lg">
                      <img
                        src={pdfPreviewUrl}
                        alt="Document Preview"
                        className="max-w-full h-auto"
                        onError={() => {
                          setPdfError(true);
                        }}
                      />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <a
                        href={pdfPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <LuExternalLink className="w-5 h-5" />
                        Open in New Tab
                      </a>
                      <a
                        href={pdfPreviewUrl}
                        download
                        className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <LuDownload className="w-5 h-5" />
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    {pdfError && pdfPreviewUrl.toLowerCase().endsWith('.pdf') ? (
                      <>
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                          <LuFileText className="w-14 h-14 text-blue-600" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-3">PDF Document Ready</h4>
                        <p className="text-sm text-gray-600 mb-2 text-center max-w-md">
                          Due to security restrictions, this PDF cannot be previewed in an embedded viewer.
                        </p>
                        <p className="text-xs text-gray-500 mb-6 text-center">
                          Click the button below to open and view the document in a new tab.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <LuFile className="w-14 h-14 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Document Preview Unavailable</h4>
                        <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
                          This file type cannot be previewed in the browser. Please open it in a new tab.
                        </p>
                      </>
                    )}
                    <div className="flex gap-3">
                      <a
                        href={pdfPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <LuExternalLink className="w-5 h-5" />
                        Open in New Tab
                      </a>
                      <a
                        href={pdfPreviewUrl}
                        download
                        className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <LuDownload className="w-5 h-5" />
                        Download
                      </a>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* PDF Preview Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
              <a
                href={pdfPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <LuExternalLink className="w-4 h-4" />
                Open in new tab
              </a>
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setPdfPreviewUrl(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Accordion Section Component
const AccordionSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <LuChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 py-4 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Info Field Component
const InfoField = ({ label, value, colSpan = 1 }) => {
  // Handle React elements or strings
  const displayValue = typeof value === 'object' && value !== null && !React.isValidElement(value) 
    ? JSON.stringify(value) 
    : value;
  
  return (
    <div className={colSpan === 2 ? "col-span-2" : ""}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-gray-900">
        {React.isValidElement(value) ? value : (displayValue || "N/A")}
      </div>
    </div>
  );
};

// URL Field Component for PDF links
const UrlField = ({ label, url, onClick }) => {
  if (!url) {
    return (
      <div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="text-sm font-medium text-gray-500">N/A</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <button
        onClick={onClick}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
      >
        <LuFileText className="w-4 h-4" />
        View {label}
      </button>
    </div>
  );
};

export default CandidateInfoModal;

