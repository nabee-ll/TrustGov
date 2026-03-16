import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { servicesAPI, applicationsAPI } from '../services/api.js';
import { useAuth } from '../App.jsx';

const STEPS = ['Select Service', 'Vehicle Details', 'Owner Details', 'Review & Submit'];

export default function VehicleRegistration() {
  const { user }     = useAuth();
  const location     = useLocation();
  const navigate     = useNavigate();

  const [services, setServices]     = useState([]);
  const [step, setStep]             = useState(0);
  const [selectedService, setSelectedService] = useState(location.state?.serviceId || '');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null);
  const [error, setError]           = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    fullName:      user?.name  || '',
    email:         user?.email || '',
    phone:         user?.phone || '',
    address:       '',
    vehicleType:   '',
    vehicleMake:   '',
    vehicleModel:  '',
    vehicleYear:   '',
    vehicleNumber: '',
    engineNumber:  '',
    chassisNumber: '',
    fuelType:      '',
    documents:     [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await servicesAPI.getAll('Vehicle Registration');
        setServices(data.data || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const validate = (s) => {
    const errs = {};
    if (s === 0 && !selectedService) errs.service = 'Please select a service';
    if (s === 1) {
      if (!form.vehicleType.trim())   errs.vehicleType  = 'Vehicle type is required';
      if (!form.vehicleMake.trim())   errs.vehicleMake  = 'Make is required';
      if (!form.vehicleModel.trim())  errs.vehicleModel = 'Model is required';
      if (!form.vehicleYear.trim())   errs.vehicleYear  = 'Year is required';
      if (!form.fuelType.trim())      errs.fuelType     = 'Fuel type is required';
    }
    if (s === 2) {
      if (!form.fullName.trim())  errs.fullName = 'Full name is required';
      if (!form.email.trim())     errs.email    = 'Email is required';
      if (!form.phone.trim())     errs.phone    = 'Phone is required';
      else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter valid 10-digit number';
      if (!form.address.trim())   errs.address  = 'Address is required';
    }
    return errs;
  };

  const goNext = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const { data } = await applicationsAPI.apply({
        serviceId:     selectedService,
        fullName:      form.fullName,
        email:         form.email,
        phone:         form.phone,
        address:       form.address,
        vehicleNumber: form.vehicleNumber,
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
        <div className="inline-block w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Loading services...</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="text-6xl mb-4">🚗</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-6">Your vehicle registration application has been received.</p>
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
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">View Dashboard</button>
          <button onClick={() => navigate('/application-status')} className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-5 rounded transition-all">Track Status</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-green-900 text-white rounded-t-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          <div>
            <h1 className="text-lg font-bold">Vehicle Registration Services</h1>
            <p className="text-green-300 text-xs">Register your vehicle online with ease</p>
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
                  i === step ? 'bg-green-700 border-green-700 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-xl px-6 py-6 shadow-sm">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step 0 */}
        {step === 0 && (
          <div>
            <h2 className="section-title">Select Registration Service</h2>
            {formErrors.service && <p className="text-red-500 text-sm mb-3">{formErrors.service}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => (
                <div key={svc._id} onClick={() => { setSelectedService(svc._id); setFormErrors({}); }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedService === svc._id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
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
                  {selectedService === svc._id && <div className="mt-2 text-xs text-green-600 font-semibold">✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 – Vehicle Details */}
        {step === 1 && (
          <div>
            <h2 className="section-title">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Vehicle Type *</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleChange}
                  className={`form-input ${formErrors.vehicleType ? 'border-red-400' : ''}`}>
                  <option value="">Select Type</option>
                  {['Two Wheeler', 'Three Wheeler', 'Four Wheeler', 'Heavy Motor Vehicle', 'Light Motor Vehicle'].map((t) => <option key={t}>{t}</option>)}
                </select>
                {formErrors.vehicleType && <p className="text-red-500 text-xs mt-1">{formErrors.vehicleType}</p>}
              </div>

              <div>
                <label className="form-label">Fuel Type *</label>
                <select name="fuelType" value={form.fuelType} onChange={handleChange}
                  className={`form-input ${formErrors.fuelType ? 'border-red-400' : ''}`}>
                  <option value="">Select Fuel Type</option>
                  {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG'].map((f) => <option key={f}>{f}</option>)}
                </select>
                {formErrors.fuelType && <p className="text-red-500 text-xs mt-1">{formErrors.fuelType}</p>}
              </div>

              {[
                { name: 'vehicleMake',   label: 'Vehicle Make *',   placeholder: 'e.g. Maruti Suzuki, Tata, Honda' },
                { name: 'vehicleModel',  label: 'Vehicle Model *',  placeholder: 'e.g. Swift, Nexon, Activa' },
                { name: 'vehicleYear',   label: 'Year of Manufacture *', placeholder: 'e.g. 2023' },
                { name: 'vehicleNumber', label: 'Temporary Reg. Number', placeholder: 'e.g. TR-TN-01-2024-000001' },
                { name: 'engineNumber',  label: 'Engine Number',    placeholder: 'As per RC / Invoice' },
                { name: 'chassisNumber', label: 'Chassis Number',   placeholder: '17-character VIN number' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <input type="text" name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className={`form-input ${formErrors[name] ? 'border-red-400' : ''}`} />
                  {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 – Owner Details */}
        {step === 2 && (
          <div>
            <h2 className="section-title">Owner Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'fullName', label: 'Full Name *',     type: 'text',  placeholder: 'As per Aadhaar' },
                { name: 'email',    label: 'Email *',         type: 'email', placeholder: 'Active email address' },
                { name: 'phone',    label: 'Mobile Number *', type: 'tel',   placeholder: '10-digit mobile number' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <input type={type} name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className={`form-input ${formErrors[name] ? 'border-red-400' : ''}`} />
                  {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="form-label">Address *</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                  placeholder="Full address as per Aadhaar Card"
                  className={`form-input resize-none ${formErrors.address ? 'border-red-400' : ''}`} />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>
            </div>

            {selectedSvc && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-800 mb-2">Required Documents for "{selectedSvc.serviceName}":</p>
                <div className="space-y-2">
                  {selectedSvc.requiredDocuments.map((doc) => (
                    <label key={doc} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.documents.includes(doc)}
                        onChange={(e) => setForm((f) => ({
                          ...f, documents: e.target.checked
                            ? [...f.documents, doc]
                            : f.documents.filter((d) => d !== doc)
                        }))}
                        className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 – Review */}
        {step === 3 && (
          <div>
            <h2 className="section-title">Review Application</h2>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-bold text-green-700 uppercase mb-2">Selected Service</p>
                <p className="font-semibold">{selectedSvc?.serviceName}</p>
                <p className="text-xs text-gray-500">Fee: {selectedSvc?.fees > 0 ? `₹${selectedSvc?.fees}` : 'Free'} • {selectedSvc?.processingDays} working days</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-600 uppercase mb-3">Vehicle Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Type', form.vehicleType], ['Make', form.vehicleMake],
                    ['Model', form.vehicleModel], ['Year', form.vehicleYear],
                    ['Fuel', form.fuelType], ['Temp. No.', form.vehicleNumber || 'N/A'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-gray-400">{l}</p>
                      <p className="font-medium text-gray-800">{v || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold text-gray-600 uppercase mb-3">Owner Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[['Name', form.fullName], ['Email', form.email], ['Phone', form.phone]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-gray-400">{l}</p>
                      <p className="font-medium text-gray-800">{v || '-'}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="font-medium text-gray-800">{form.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                <p className="font-semibold">Declaration:</p>
                <p className="mt-1">I declare that all information provided is true and correct. I understand that false information is a punishable offence under Motor Vehicles Act, 1988.</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-6 rounded transition-colors">
              ← Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button onClick={goNext} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition-colors">
              Next Step →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-8 rounded transition-colors flex items-center gap-2">
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
