import { useState } from "react";
import { generateId } from "document-model/core";
import type {
  MultisigParticipationAgreementState,
  SignerType,
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { MultisigParticipationAgreementAction } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import {
  initializeMpa,
  setActiveSigner,
  setWallet,
  setProcessDetails,
  addPolicyLink,
  removePolicyLink,
  addAssociationSigner,
  removeAssociationSigner,
  submitForSignature,
} from "../../../document-models/multisig-participation-agreement/gen/agreement/creators.js";
import { SectionCard } from "./SectionCard.js";

interface DraftPhaseProps {
  state: MultisigParticipationAgreementState;
  dispatch: DocumentDispatch<MultisigParticipationAgreementAction>;
}

export function DraftPhase({ state, dispatch }: DraftPhaseProps) {
  const [newSignerName, setNewSignerName] = useState("");
  const [newSignerFunction, setNewSignerFunction] = useState("");
  const [newPolicyLabel, setNewPolicyLabel] = useState("");
  const [newPolicyUrl, setNewPolicyUrl] = useState("");
  const [newWalletAddress, setNewWalletAddress] = useState("");

  function handleInitialize() {
    dispatch(initializeMpa({ associationName: state.associationName ?? "" }));
  }

  function handleAssociationNameBlur(value: string) {
    if (value.trim()) {
      dispatch(
        initializeMpa({
          associationName: value.trim(),
          templateVersion: state.templateVersion ?? undefined,
        }),
      );
    }
  }

  function handleTemplateVersionBlur(value: string) {
    if (value.trim()) {
      dispatch(
        initializeMpa({
          templateVersion: value.trim(),
          associationName: state.associationName ?? undefined,
        }),
      );
    }
  }

  function handleSetActiveSigner(field: string, value: string | boolean) {
    if (!state.activeSigner) return;
    dispatch(
      setActiveSigner({
        type: state.activeSigner.type,
        name: state.activeSigner.name ?? undefined,
        isAnonymous: state.activeSigner.isAnonymous ?? false,
        citizenship: state.activeSigner.citizenship ?? undefined,
        residenceCountry: state.activeSigner.residenceCountry ?? undefined,
        incorporationCity: state.activeSigner.incorporationCity ?? undefined,
        incorporationCountry:
          state.activeSigner.incorporationCountry ?? undefined,
        [field]: value,
      }),
    );
  }

  function handleSetSignerType(type: SignerType) {
    dispatch(
      setActiveSigner({
        type,
        name: state.activeSigner?.name ?? undefined,
        isAnonymous: state.activeSigner?.isAnonymous ?? false,
        citizenship: state.activeSigner?.citizenship ?? undefined,
        residenceCountry: state.activeSigner?.residenceCountry ?? undefined,
        incorporationCity: state.activeSigner?.incorporationCity ?? undefined,
        incorporationCountry:
          state.activeSigner?.incorporationCountry ?? undefined,
      }),
    );
  }

  function handleAddAssociationSigner() {
    if (!newSignerName.trim()) return;
    dispatch(
      addAssociationSigner({
        id: generateId(),
        name: newSignerName.trim(),
        function: newSignerFunction.trim() || undefined,
      }),
    );
    setNewSignerName("");
    setNewSignerFunction("");
  }

  function handleAddPolicyLink() {
    if (!newPolicyUrl.trim()) return;
    dispatch(
      addPolicyLink({
        id: generateId(),
        label: newPolicyLabel.trim() || undefined,
        url: newPolicyUrl.trim(),
        snapshotDate: new Date().toISOString(),
      }),
    );
    setNewPolicyLabel("");
    setNewPolicyUrl("");
  }

  function handleAddWalletAddress() {
    if (!newWalletAddress.trim()) return;
    const current = state.wallet?.walletAddresses ?? [];
    dispatch(
      setWallet({
        numberOfKeys: state.wallet?.numberOfKeys ?? undefined,
        decisionQuorum: state.wallet?.decisionQuorum ?? undefined,
        signaturePlatform: state.wallet?.signaturePlatform ?? undefined,
        walletAddresses: [...current, newWalletAddress.trim()],
      }),
    );
    setNewWalletAddress("");
  }

  function handleRemoveWalletAddress(addr: string) {
    const updated = (state.wallet?.walletAddresses ?? []).filter(
      (a) => a !== addr,
    );
    dispatch(
      setWallet({
        numberOfKeys: state.wallet?.numberOfKeys ?? undefined,
        decisionQuorum: state.wallet?.decisionQuorum ?? undefined,
        signaturePlatform: state.wallet?.signaturePlatform ?? undefined,
        walletAddresses: updated,
      }),
    );
  }

  return (
    <div className="space-y-6">
      {/* Agreement Info */}
      <SectionCard title="Agreement Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Association Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={state.associationName ?? ""}
              onBlur={(e) => handleAssociationNameBlur(e.target.value)}
              placeholder="e.g. MakerDAO"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template Version
            </label>
            <input
              type="text"
              defaultValue={state.templateVersion ?? ""}
              onBlur={(e) => handleTemplateVersionBlur(e.target.value)}
              placeholder="e.g. v2.0"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        {!state.status && (
          <button
            onClick={handleInitialize}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Initialize MPA
          </button>
        )}
      </SectionCard>

      {/* Active Signer */}
      <SectionCard title="Active Signer (Participant)">
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="signerType"
                value="NATURAL_PERSON"
                checked={state.activeSigner?.type === "NATURAL_PERSON"}
                onChange={() => handleSetSignerType("NATURAL_PERSON")}
              />
              Natural Person
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="signerType"
                value="LEGAL_ENTITY"
                checked={state.activeSigner?.type === "LEGAL_ENTITY"}
                onChange={() => handleSetSignerType("LEGAL_ENTITY")}
              />
              Legal Entity
            </label>
          </div>

          {state.activeSigner && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name / Entity Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={state.activeSigner.name ?? ""}
                  onBlur={(e) =>
                    handleSetActiveSigner("name", e.target.value.trim())
                  }
                  placeholder="Legal name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {state.activeSigner.type === "NATURAL_PERSON" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Citizenship
                    </label>
                    <input
                      type="text"
                      defaultValue={state.activeSigner.citizenship ?? ""}
                      onBlur={(e) =>
                        handleSetActiveSigner(
                          "citizenship",
                          e.target.value.trim(),
                        )
                      }
                      placeholder="Country"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Residence Country
                    </label>
                    <input
                      type="text"
                      defaultValue={state.activeSigner.residenceCountry ?? ""}
                      onBlur={(e) =>
                        handleSetActiveSigner(
                          "residenceCountry",
                          e.target.value.trim(),
                        )
                      }
                      placeholder="Country"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={state.activeSigner.isAnonymous ?? false}
                        onChange={(e) =>
                          handleSetActiveSigner("isAnonymous", e.target.checked)
                        }
                      />
                      Anonymous signer
                    </label>
                  </div>
                </>
              )}

              {state.activeSigner.type === "LEGAL_ENTITY" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Incorporation City
                    </label>
                    <input
                      type="text"
                      defaultValue={state.activeSigner.incorporationCity ?? ""}
                      onBlur={(e) =>
                        handleSetActiveSigner(
                          "incorporationCity",
                          e.target.value.trim(),
                        )
                      }
                      placeholder="City"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Incorporation Country
                    </label>
                    <input
                      type="text"
                      defaultValue={
                        state.activeSigner.incorporationCountry ?? ""
                      }
                      onBlur={(e) =>
                        handleSetActiveSigner(
                          "incorporationCountry",
                          e.target.value.trim(),
                        )
                      }
                      placeholder="Country"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Wallet */}
      <SectionCard title="Wallet Configuration">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Keys <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              defaultValue={state.wallet?.numberOfKeys ?? ""}
              onBlur={(e) => {
                const v = parseInt(e.target.value);
                if (v > 0) dispatch(setWallet({ numberOfKeys: v }));
              }}
              placeholder="e.g. 3"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Decision Quorum <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              defaultValue={state.wallet?.decisionQuorum ?? ""}
              onBlur={(e) => {
                const v = parseInt(e.target.value);
                if (v > 0) dispatch(setWallet({ decisionQuorum: v }));
              }}
              placeholder="e.g. 2"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Signature Platform <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={state.wallet?.signaturePlatform ?? ""}
              onBlur={(e) => {
                if (e.target.value.trim())
                  dispatch(
                    setWallet({ signaturePlatform: e.target.value.trim() }),
                  );
              }}
              placeholder="e.g. Gnosis Safe"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Wallet Addresses
          </label>
          <div className="mt-2 space-y-2">
            {(state.wallet?.walletAddresses ?? []).map((addr) => (
              <div key={addr} className="flex items-center gap-2">
                <span className="flex-1 rounded bg-gray-50 px-3 py-1.5 font-mono text-xs text-gray-700 border border-gray-200">
                  {addr}
                </span>
                <button
                  onClick={() => handleRemoveWalletAddress(addr)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddWalletAddress}
                disabled={!newWalletAddress.trim()}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Process Details */}
      <SectionCard title="Process Details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Communication Channel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={state.communicationChannel ?? ""}
              onBlur={(e) => {
                if (e.target.value.trim())
                  dispatch(
                    setProcessDetails({
                      communicationChannel: e.target.value.trim(),
                    }),
                  );
              }}
              placeholder="e.g. Signal, Telegram, Email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unavailability Threshold (hours){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              defaultValue={state.unavailabilityThresholdHours ?? ""}
              onBlur={(e) => {
                const v = parseInt(e.target.value);
                if (v > 0)
                  dispatch(
                    setProcessDetails({ unavailabilityThresholdHours: v }),
                  );
              }}
              placeholder="e.g. 48"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </SectionCard>

      {/* Association Signers */}
      <SectionCard title="Association Signers">
        <div className="space-y-3">
          {state.associationSigners.map((signer) => (
            <div
              key={signer.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {signer.name ?? "—"}
                </p>
                {signer.function && (
                  <p className="text-xs text-gray-500">{signer.function}</p>
                )}
              </div>
              <button
                onClick={() =>
                  dispatch(removeAssociationSigner({ id: signer.id }))
                }
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSignerName}
              onChange={(e) => setNewSignerName(e.target.value)}
              placeholder="Full name *"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newSignerFunction}
              onChange={(e) => setNewSignerFunction(e.target.value)}
              placeholder="Function/Role"
              className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddAssociationSigner}
              disabled={!newSignerName.trim()}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Policy Links */}
      <SectionCard title="Policy Links">
        <div className="space-y-3">
          {state.policyLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {link.label ?? link.url ?? "—"}
                </p>
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {link.url}
                  </a>
                )}
              </div>
              <button
                onClick={() => dispatch(removePolicyLink({ id: link.id }))}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPolicyLabel}
              onChange={(e) => setNewPolicyLabel(e.target.value)}
              placeholder="Label (optional)"
              className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="url"
              value={newPolicyUrl}
              onChange={(e) => setNewPolicyUrl(e.target.value)}
              placeholder="URL *"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAddPolicyLink}
              disabled={!newPolicyUrl.trim()}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Submit for Signature */}
      {state.status === "DRAFT" && (
        <div className="flex justify-end">
          <button
            onClick={() => dispatch(submitForSignature({}))}
            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit for Signature
          </button>
        </div>
      )}
    </div>
  );
}
