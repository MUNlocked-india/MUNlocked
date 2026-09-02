"use client";

import { useEffect, useState } from "react";
import { submitEbApplication } from "@/app/(app)/hire-eb/apply/actions";
import { COMMITTEE_EXPERTISE, EB_ROLES, REMUNERATION_OPTIONS } from "@/lib/eb-profile-options";

export default function EbProfileForm({ error }: { error?: string }) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [cvPreview, setCvPreview] = useState<string | null>(null);
  const [cvName, setCvName] = useState("");

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);
  useEffect(() => () => { if (cvPreview) URL.revokeObjectURL(cvPreview); }, [cvPreview]);

  function previewPhoto(file?: File) {
    if (!file) return;
    setPhotoPreview((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
    setPhotoName(file.name);
  }
  function previewCv(file?: File) {
    if (!file) return;
    setCvPreview((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
    setCvName(file.name);
  }

  return <form action={submitEbApplication} encType="multipart/form-data" className="eb-profile-form">
    <div className="eb-form-heading"><span className="mono">PROFILE / EXECUTIVE BOARD</span><h1>Make your record<br />easy to trust.</h1><p>Your profile is published straight to the marketplace. Keep it formal, specific and ready for organisers to review.</p></div>
    {error && <p className="eb-form-error" role="alert">{error}</p>}

    <section className="eb-form-section"><div className="eb-section-label"><span>01</span><div><h2>The person behind the gavel</h2><p>Start with a professional snapshot.</p></div></div><div className="eb-form-grid"><label className="eb-field eb-field-wide"><span>Short bio</span><textarea name="bio" required rows={3} placeholder="Your MUN approach, leadership style and the work you care about." /></label><label className="eb-upload-card"><input name="photo" type="file" required accept="image/jpeg,image/png,image/webp" onChange={(event) => previewPhoto(event.target.files?.[0])} /><div className="eb-upload-preview">{photoPreview ? <img src={photoPreview} alt="Selected formal profile preview" /> : <span>Formal<br />photo</span>}</div><div><b>{photoName || "Upload formal photo"}</b><small>JPG, PNG or WebP · up to 5 MB</small></div></label><label className="eb-upload-card"><input name="cv" type="file" required accept="application/pdf" onChange={(event) => previewCv(event.target.files?.[0])} /><div className="eb-cv-preview">{cvPreview ? <object data={cvPreview} type="application/pdf" aria-label="Selected CV cover page"><span>PDF</span></object> : <span>CV<br />PDF</span>}</div><div><b>{cvName || "Upload CV / portfolio"}</b><small>The first page is previewed here · PDF up to 10 MB</small></div></label></div></section>

    <section className="eb-form-section"><div className="eb-section-label"><span>02</span><div><h2>Your MUN record</h2><p>Give organisers the context that matters.</p></div></div><div className="eb-form-grid"><label className="eb-field"><span>Executive Board experience</span><textarea name="eb_experience" required rows={5} placeholder="Roles chaired, committees, conferences and a few meaningful outcomes." /></label><label className="eb-field"><span>Delegate experience</span><textarea name="delegate_experience" required rows={5} placeholder="Committees represented, awards, portfolios or negotiating experience." /></label><label className="eb-field eb-field-wide"><span>Previous conferences <em>Optional</em></span><textarea name="previous_conferences" rows={2} placeholder="Example: Aethris MUN 2025 — Vice Chair, UNSC" /></label></div></section>

    <section className="eb-form-section"><div className="eb-section-label"><span>03</span><div><h2>Where you work best</h2><p>Select every committee family you can chair confidently.</p></div></div><label className="eb-field eb-field-wide"><span>Areas of expertise</span><select name="areas_of_expertise" required multiple size={8} aria-describedby="expertise-hint">{COMMITTEE_EXPERTISE.map((committee) => <option key={committee} value={committee}>{committee}</option>)}</select><small id="expertise-hint">Hold Ctrl (Windows) or ⌘ (Mac) to select more than one committee.</small></label></section>

    <section className="eb-form-section"><div className="eb-section-label"><span>04</span><div><h2>Role & remuneration</h2><p>One clear availability card—set your expectation for each dais role.</p></div></div><div className="eb-remuneration-card">{EB_ROLES.map(({ key, label }) => <label key={key}><span>{label}</span><select name={`remuneration_${key}`} required defaultValue=""><option value="" disabled>Select expectation</option>{REMUNERATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</div></section>
    <button type="submit" className="eb-publish-button">Publish my EB profile <span>↗</span></button><p className="eb-form-footnote">Your profile appears immediately on the marketplace, your profile manager and the homepage showcase. We&apos;ll also email your registered address once it is submitted.</p>
  </form>;
}
