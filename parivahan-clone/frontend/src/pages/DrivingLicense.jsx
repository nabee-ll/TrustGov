import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { servicesAPI, applicationsAPI } from '../services/api.js';
import { useAuth } from '../App.jsx';

const dlServices = ['Driving Licence', 'Permits'];

const STEPS = ['Select Service', 'Personal Details', 'Documents', 'Review & Submit'];

export default function DrivingLicense() {
  const { user }      = useAuth();
  const location      = useLocation();
  const navigate      = useNavigate();

  const [services, setServices]     = useState([]);
  const [step, setStep]             = useState(0);
  const [selectedService, setSelectedService] = useState(location.state?.serviceId || '');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    fullName:      user?.name || '',
    email:         user?.email || '',
    phone:         user?.phone || '',
    address:       '',
    dateOfBirth:   '',
    licenceNumber: '',
    bloodGroup:    '',
    gender:        '',
    documents:     [],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await servicesAPI.getAll();
        const filtered = (data.data || []).filter((s) => dlServices.includes(s.category));
        setServices(filtered);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!selectedService) errs.service = 'Please select a service';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.fullName.trim())    errs.fullName = 'Full name is required';
    if (!form.email.trim())       errs.email = 'Email is required';
    if (!form.phone.trim())       errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter valid 10-digit number';
    if (!form.address.trim())     errs.address = 'Address is required';
    if (!form.dateOfBirth)        errs.dateOfBirth = 'Date of birth is required';
    if (!form.gender)             errs.gender = 'Please select gender';
    return errs;
  };

  const goNext = () => {
    const errs = step === 0 ? validateStep1() : step === 1 ? validateStep2() : {};
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await applicationsAPI.apply({
        serviceId:     selectedService,
        fullName:      form.fullName,
        email:         form.email,
        phone:         form.phone,
        address:       form.address,
        dateOfBirth:   form.dateOfBirth,
        licenceNumber: form.licenceNumber,
        documents:     form.documents,
      });
      setSubmitted(data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSvc = services.find((s) => s._id === selectedService);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Loading services...</p>
      </div>
    </div>
  );

  // Success screen
  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-6">Your application has been received and is being processed.</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Application No:</span>
              <span className="font-mono font-bold text-green-700 text-lg">{submitted.applicationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service:</span>
              <span className="font-medium">{submitted.service?.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-semibold border border-yellow-300">
                {submitted.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Processing Time:</span>
              <span className="font-medium">{submitted.service?.processingDays} working days</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Save your application number for future reference. You can track status at any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">View Dashboard</button>
          <button onClick={() => navigate('/application-status')} className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-5 rounded transition-all">
            Track Status
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Page title */}
      <div className="bg-blue-900 text-white rounded-t-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪪</span>
          <div>
            <h1 className="text-lg font-bold">Driving Licence Services</h1>
            <p className="text-blue-300 text-xs">Apply online – No RTO visit required for select services</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-x border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < step ? 'bg-green-500 border-green-500 text-white' :
                  i === step ? 'bg-blue-700 border-blue-700 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-blue-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form body */}
      <div className="bg-white border border-gray-200 rounded-b-xl px-6 py-6 shadow-sm">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step 0 – Select Service */}
        {step === 0 && (
          <div>
            <h2 className="section-title">Select Service</h2>
            {formErrors.service && <p className="text-red-500 text-sm mb-3">{formErrors.service}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => (
                <div
                  key={svc._id}
                  onClick={() => { setSelectedService(svc._id); setFormErrors({}); }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedService === svc._id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{svc.serviceName}</p>
                      <p className="text-xs text-gray-500 mt-1">{svc.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-green-700 font-bold text-sm">{svc.fees > 0 ? `₹${svc.fees}` : 'Free'}</p>
                      <p className="text-xs text-gray-400">{svc.processingDays} days</p>
                    </div>
                  </div>
                  {selectedService === svc._id && (
                    <div className="mt-2 text-xs text-blue-600 font-semibold">✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 – Personal Details */}
        {step === 1 && (
          <div>
            <h2 className="section-title">Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'fullName',    label: 'Full Name *',         type: 'text',   placeholder: 'As per Aadhaar' },
                { name: 'email',       label: 'Email Address *',     type: 'email',  placeholder: 'Active email address' },
                { name: 'phone',       label: 'Mobile Number *',     type: 'tel',    placeholder: '10-digit mobile number' },
                { name: 'dateOfBirth', label: 'Date of Birth *',     type: 'date',   placeholder: '' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <input type={type} name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className={`form-input ${formErrors[name] ? 'border-red-400' : ''}`} />
                  {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
                </div>
              ))}

              <div>
                <label className="form-label">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className={`form-input ${formErrors.gender ? 'border-red-400' : ''}`}>
                  <option value="">Select Gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
                {formErrors.gender && <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>}
              </div>

              <div>
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="form-input">
                  <option value="">Select Blood Group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Existing Licence Number (if applicable)</label>
                <input type="text" name="licenceNumber" value={form.licenceNumber} onChange={handleChange}
                  placeholder="e.g. TN01 20190012345"
                  className="form-input" />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Present Address *</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                  placeholder="Full address with PIN code"
                  className={`form-input resize-none ${formErrors.address ? 'border-red-400' : ''}`} />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 – Documents */}
        {step === 2 && (
          <div>
            <h2 className="section-title">Documents Required</h2>
            {selectedSvc && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  For "{selectedSvc.serviceName}", you need:
                </p>
                <ul className="space-y-2">
                  {selectedSvc.requiredDocuments.map((doc) => (
                    <li key={doc} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={doc}
                        checked={form.documents.includes(doc)}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            documents: e.target.checked
                              ? [...f.documents, doc]
                              : f.documents.filter((d) => d !== doc),
                          }))
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor={doc} className="text-sm text-gray-700 cursor-pointer">{doc}</label>
                      <span className="ml-auto text-xs text-green-600 font-medium">✓ Self-Attested</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Important Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All documents must be self-attested</li>
                <li>Documents should be clear and legible</li>
                <li>Original documents must be presented at RTO (if required)</li>
                <li>File size must not exceed 200 KB per document</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3 – Review */}
        {step === 3 && (
          <div>
            <h2 className="section-title">Review Your Application</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-700 uppercase mb-2">Selected Service</p>
                <p className="font-semibold text-gray-800">{selectedSvc?.serviceName}</p>
                <p className="text-xs text-gray-500">{selectedSvc?.category} • Fee: {selectedSvc?.fees > 0 ? `₹${selectedSvc?.fees}` : 'Free'} • {selectedSvc?.processingDays} days</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-600 uppercase mb-3">Applicant Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Full Name', form.fullName],
                    ['Email', form.email],
                    ['Phone', form.phone],
                    ['Date of Birth', form.dateOfBirth],
                    ['Gender', form.gender],
                    ['Blood Group', form.bloodGroup || 'Not provided'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="font-medium text-gray-800">{value || '-'}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="font-medium text-gray-800">{form.address}</p>
                  </div>
                </div>
              </div>

              {form.documents.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-bold text-green-700 uppercase mb-2">Documents Confirmed</p>
                  <div className="flex flex-wrap gap-2">
                    {form.documents.map((d) => (
                      <span key={d} className="text-xs bg-white border border-green-300 text-green-700 px-2 py-1 rounded">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                <p className="font-semibold">Declaration:</p>
                <p className="mt-1">I hereby declare that all information provided is true and correct to the best of my knowledge. I understand that providing false information is a punishable offence.</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-6 rounded transition-colors">
              ← Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button onClick={goNext} className="btn-primary">
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-8 rounded transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting...</>
              ) : '✓ Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
