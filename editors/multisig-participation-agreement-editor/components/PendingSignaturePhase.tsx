import { useState } from "react";
import type { MultisigParticipationAgreementState } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { MultisigParticipationAgreementAction } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import {
  recordAssociationSignature,
  recordActiveSignerSignature,
} from "../../../document-models/multisig-participation-agreement/gen/agreement/creators.js";
import { SectionCard } from "./SectionCard.js";

interface PendingSignaturePhaseProps {
  state: MultisigParticipationAgreementState;
  dispatch: DocumentDispatch<MultisigParticipationAgreementAction>;
}

interface SignatureFormState {
  place: string;
  date: string;
  platform: string;
  reference: string;
  timestamp: string;
  effectiveDate: string;
}

const EMPTY_FORM: SignatureFormState = {
  place: "",
  date: new Date().toISOString().substring(0, 10),
  platform: "",
  reference: "",
  timestamp: new Date().toISOString(),
  effectiveDate: new Date().toISOString().substring(0, 10),
};

export function PendingSignaturePhase({
  state,
  dispatch,
}: PendingSignaturePhaseProps) {
  const [activeSignerForm, setActiveSignerForm] =
    useState<SignatureFormState>(EMPTY_FORM);
  const [signingSignerId, setSigningSignerId] = useState<string | null>(null);
  const [assocForm, setAssocForm] = useState<SignatureFormState>(EMPTY_FORM);

  function handleRecordAssocSignature(signerId: string) {
    if (!assocForm.platform || !assocForm.reference) return;
    dispatch(
      recordAssociationSignature({
        signerId,
        place: assocForm.place || undefined,
        date: new Date(assocForm.date).toISOString(),
        eSignaturePlatform: assocForm.platform,
        eSignatureReference: assocForm.reference,
        eSignatureTimestamp: assocForm.timestamp,
      }),
    );
    setSigningSignerId(null);
    setAssocForm(EMPTY_FORM);
  }

  function handleRecordActiveSignerSignature() {
    if (!activeSignerForm.platform || !activeSignerForm.reference) return;
    dispatch(
      recordActiveSignerSignature({
        place: activeSignerForm.place || undefined,
        date: new Date(activeSignerForm.date).toISOString(),
        eSignaturePlatform: activeSignerForm.platform,
        eSignatureReference: activeSignerForm.reference,
        eSignatureTimestamp: activeSignerForm.timestamp,
        effectiveDate: new Date(activeSignerForm.effectiveDate).toISOString(),
      }),
    );
  }

  const allAssocSigned =
    state.associationSigners.length > 0 &&
    state.associationSigners.every((s) => s.signature !== null);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        This MPA is awaiting signatures from all parties. Once all association
        signers and the active signer have signed, the agreement becomes{" "}
        <strong>Active</strong>.
      </div>

      {/* Association Signers */}
      <SectionCard title="Association Signatures">
        <div className="space-y-4">
          {state.associationSigners.map((signer) => (
            <div
              key={signer.id}
              className="rounded-md border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {signer.name ?? "—"}
                  </p>
                  {signer.function && (
                    <p className="text-xs text-gray-500">{signer.function}</p>
                  )}
                </div>
                {signer.signature ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Signed
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      setSigningSignerId(
                        signingSignerId === signer.id ? null : signer.id,
                      )
                    }
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    {signingSignerId === signer.id
                      ? "Cancel"
                      : "Record Signature"}
                  </button>
                )}
              </div>

              {signer.signature && (
                <div className="mt-2 text-xs text-gray-500">
                  <p>Platform: {signer.signature.eSignaturePlatform}</p>
                  <p>Ref: {signer.signature.eSignatureReference}</p>
                  <p>
                    Date:{" "}
                    {signer.signature.date
                      ? new Date(signer.signature.date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              )}

              {signingSignerId === signer.id && (
                <div className="mt-3 space-y-3 rounded-md border border-blue-100 bg-blue-50 p-3">
                  <h4 className="text-xs font-semibold text-blue-800">
                    Record e-Signature
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600">
                        Platform *
                      </label>
                      <input
                        type="text"
                        value={assocForm.platform}
                        onChange={(e) =>
                          setAssocForm((f) => ({
                            ...f,
                            platform: e.target.value,
                          }))
                        }
                        placeholder="e.g. DocuSign"
                        className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">
                        Reference *
                      </label>
                      <input
                        type="text"
                        value={assocForm.reference}
                        onChange={(e) =>
                          setAssocForm((f) => ({
                            ...f,
                            reference: e.target.value,
                          }))
                        }
                        placeholder="Signature ID / hash"
                        className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">
                        Date
                      </label>
                      <input
                        type="date"
                        value={assocForm.date}
                        onChange={(e) =>
                          setAssocForm((f) => ({ ...f, date: e.target.value }))
                        }
                        className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">
                        Place
                      </label>
                      <input
                        type="text"
                        value={assocForm.place}
                        onChange={(e) =>
                          setAssocForm((f) => ({
                            ...f,
                            place: e.target.value,
                          }))
                        }
                        placeholder="City, Country"
                        className="mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRecordAssocSignature(signer.id)}
                    disabled={!assocForm.platform || !assocForm.reference}
                    className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Confirm Signature
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Active Signer */}
      <SectionCard title="Active Signer Signature">
        {state.activeSignerSignature ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Signed
            </span>
            <span className="text-xs text-gray-500">
              {state.activeSignerSignature.eSignaturePlatform} ·{" "}
              {state.activeSignerSignature.eSignatureReference}
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {!allAssocSigned && (
              <p className="text-sm text-gray-500">
                Waiting for all association signers to sign first.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Platform *
                </label>
                <input
                  type="text"
                  value={activeSignerForm.platform}
                  onChange={(e) =>
                    setActiveSignerForm((f) => ({
                      ...f,
                      platform: e.target.value,
                    }))
                  }
                  placeholder="e.g. DocuSign"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference *
                </label>
                <input
                  type="text"
                  value={activeSignerForm.reference}
                  onChange={(e) =>
                    setActiveSignerForm((f) => ({
                      ...f,
                      reference: e.target.value,
                    }))
                  }
                  placeholder="Signature ID / hash"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Signature Date
                </label>
                <input
                  type="date"
                  value={activeSignerForm.date}
                  onChange={(e) =>
                    setActiveSignerForm((f) => ({
                      ...f,
                      date: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={activeSignerForm.effectiveDate}
                  onChange={(e) =>
                    setActiveSignerForm((f) => ({
                      ...f,
                      effectiveDate: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Place
                </label>
                <input
                  type="text"
                  value={activeSignerForm.place}
                  onChange={(e) =>
                    setActiveSignerForm((f) => ({
                      ...f,
                      place: e.target.value,
                    }))
                  }
                  placeholder="City, Country"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleRecordActiveSignerSignature}
              disabled={
                !activeSignerForm.platform ||
                !activeSignerForm.reference ||
                !activeSignerForm.effectiveDate
              }
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Record My Signature
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
