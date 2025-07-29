import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UniversalLayout from "../universal/UniversalLayout";
import UniversalInput from "../universal/UniversalInput";
import UniversalDropdown from "../universal/UniversalDropdown";
import UniversalButton from "../universal/UniversalButton";
import {
    getMemberById,
    getAllSites,
    getAllTeams,
    updateMemberFields,
    replaceDocument,
    assignSiteWithHistory
} from "../../firebase/services/registrationService";

function ModifyMember({ name, role }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [fileInputs, setFileInputs] = useState({});
    const [siteOptions, setSiteOptions] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [autoUnassign, setAutoUnassign] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const member = await getMemberById(id);
                if (member) {
                    setFormData(member);
                } else {
                    alert("❌ Member not found.");
                    navigate("/control/manage-members");
                }
            } catch (error) {
                console.error("🔥 Error fetching member:", error);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            const sites = await getAllSites();
            const teams = await getAllTeams();
            setSiteOptions(sites.map(site => ({ label: site, value: site })));
            setTeamOptions(teams.map(team => ({ label: team, value: team })));
        };
        fetchDropdowns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (e) => {
        const { name, value } = e.target;
        const [parent, child] = name.split(".");
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: value
            }
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFileInputs(prev => ({ ...prev, [name]: files[0] }));
    };

    const handleSelectChange = (selected, key) => {
        setFormData(prev => ({ ...prev, [key]: selected.map(opt => opt.value) }));
    };

    const handleSubmit = async () => {
        if (!formData?.personName) {
            alert("Please fill in the name before saving.");
            return;
        }

        setIsSubmitting(true);
        setStatusMessage("🔄 Updating member...");

        try {
            const uploads = {};
            for (const key in fileInputs) {
                const file = fileInputs[key];
                if (file) {
                    const url = await replaceDocument(formData.personName, key, file);
                    uploads[key] = url;
                }
            }

            const updatedData = {
                ...formData,
                documents: {
                    ...(formData?.documents || {}),
                    ...(uploads || {})
                }
            };

            // Update file/docs first
            await updateMemberFields(id, updatedData);

            // Then assign site with validation logic
            const newSite = (formData.sites || [])[0] || null;
            if (newSite) {
                await assignSiteWithHistory(
                    id,
                    newSite,
                    formData.teams || [],
                    name,
                    autoUnassign
                );
            }

            setStatusMessage("✅ Member updated successfully!");
            setTimeout(() => navigate("/control/manage-members"), 1500);
        } catch (error) {
            console.error("❌ ModifyMember update failed:", error.message);
            setStatusMessage("❌ Update failed: " + error.message);
        }

        setIsSubmitting(false);
    };

    if (!formData || Object.keys(formData).length === 0) {
        return (
            <UniversalLayout title="🛠 Modify Member Info" name={name} role={role}>
                <p className="text-center text-gray-500 py-10">⏳ Loading member data...</p>
            </UniversalLayout>
        );
    }

    return (
        <UniversalLayout title="🛠 Modify Member Info" name={name} role={role}>
            <div className="space-y-4 w-full max-w-4xl mx-auto">
                <UniversalInput label="Full Name*" name="personName" value={formData.personName || ""} onChange={handleChange} required />
                <UniversalInput label="Email" name="email" value={formData.email || ""} onChange={handleChange} />
                <UniversalInput label="Mobile Number" name="mobileNumber" value={formData.mobileNumber || ""} onChange={handleChange} />
                <UniversalInput label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber || ""} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" />
                <UniversalInput label="PAN Number" name="panNumber" value={formData.panNumber || ""} onChange={handleChange} placeholder="XXXXXXXXXX" />

                {/* Address */}
                <UniversalInput label="Address Line 1" name="address.line1" value={formData.address?.line1 || ""} onChange={handleNestedChange} />
                <UniversalInput label="Address Line 2" name="address.line2" value={formData.address?.line2 || ""} onChange={handleNestedChange} />
                <UniversalInput label="Address Line 3" name="address.line3" value={formData.address?.line3 || ""} onChange={handleNestedChange} />

                <UniversalDropdown
                    label="Site (only one)"
                    isMulti={true}
                    value={siteOptions.filter(opt => formData.sites?.includes(opt.value))}
                    onChange={(val) => handleSelectChange(val, "sites")}
                    options={siteOptions}
                />
                <UniversalDropdown
                    label="Team(s)"
                    isMulti
                    value={teamOptions.filter(opt => formData.teams?.includes(opt.value))}
                    onChange={(val) => handleSelectChange(val, "teams")}
                    options={teamOptions}
                />

                {/* Auto Unassign Checkbox */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={autoUnassign}
                        onChange={() => setAutoUnassign(!autoUnassign)}
                        className="w-4 h-4"
                    />
                    <label className="text-sm font-medium text-gray-700">
                        Auto Unassign Previous Site (for members)
                    </label>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <UniversalInput type="file" label="Aadhaar (Front)" name="aadhaarFront" onChange={handleFileChange} />
                    <UniversalInput type="file" label="Aadhaar (Back)" name="aadhaarBack" onChange={handleFileChange} />
                    <UniversalInput type="file" label="PAN Card" name="panCard" onChange={handleFileChange} />
                    <UniversalInput type="file" label="Photo" name="photo" onChange={handleFileChange} />
                    <UniversalInput type="file" label="PF Declaration" name="pf" onChange={handleFileChange} />
                </div>

                {statusMessage && (
                    <div className="pt-2 text-center">
                        <p className="text-sm font-medium text-gray-700">{statusMessage}</p>
                    </div>
                )}

                <div className="flex justify-between pt-6">
                    <button
                        onClick={() => navigate("/control/manage-members")}
                        className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-gray-800 font-semibold px-6 py-2 rounded shadow"
                    >
                        🔙 Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-br from-[#2F2F2F] to-[#505050] text-white px-6 py-2 rounded-xl shadow text-base font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
                    >
                        {isSubmitting ? "Updating..." : "💾 Save Changes"}
                    </button>
                </div>
            </div>
        </UniversalLayout>
    );
}

export default ModifyMember;
