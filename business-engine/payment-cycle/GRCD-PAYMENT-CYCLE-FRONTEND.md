# **🎨 UX / UI SSOT — MVP2: Payment Cycle**

Version: 1.1.0 (Incorporates Auditing & State Refinements)  
Status: UX-Approved  
Last Updated: 2025-12-02  
Scope: Payment-related screens & flows for MVP2.

## **0\. Design Philosophy**

“If you have to explain it, it’s already too complicated.”

The Payment Cycle UI is designed to minimize cognitive load based on the user's current job:

* **Requestor:** “Where do I request money?” and “What’s the status of my request?”  
* **Approver:** “What needs my decision right now, and who is next?”  
* **Treasury/Finance:** “What is ready to be paid?” and “Where is the slip?”

**Core Principles:**

1. **Job-first navigation:** Lanes by “My Requests,” “Need My Approval,” “Ready to Disburse.”  
2. **Single source of truth UI:** One detail screen shows everything about a payment.  
3. **No cognitive tax:** Natural language labels and clear action hierarchy.  
4. **Traceability is visible but not noisy:** Timeline lives in a dedicated sidebar.

## **1\. Screen Inventory**

### **1.1 Payment Hub (Main List) – /payments**

This is the home for all payment work.

**Primary sections (Job-Based Lanes):**

* **My Requests** – Payments I created or am the requester of.  
* **Need My Approval** – Pending approvals where I am an approver (Sorted by oldest first).  
* **Ready to Disburse** – Cases in APPROVED state (for Finance/Treasury).  
* **(Optional) All Payments** – For admins / auditors.

**Core Table Layout (Per Tab):**

* **Columns:** Status (with colored pill), Title, Amount & Currency, Category, Requester, Updated (relative time).  
* **Interaction:** Row click → open Payment Detail.  
* **Primary call-to-action (top-right):** Button: “New Payment Request” → /payments/new.

### **1.2 New Payment Request – /payments/new**

Simple, clean form with two vertical sections:

| Request Basics (left) | Context & Notes (right) |
| :---- | :---- |
| Title (Placeholder: "e.g. Deposit for new freezer equipment") | Description / Justification (multi-line) |
| Amount \+ Currency (Required) | Optional tags (chips) |
| Category (Required dropdown with semantic labels) | Optional file drop zone (supporting documents) |
| Due Date | Payee Info (type, name, account ref) |

**Primary Buttons (bottom):**

* “Save as Draft” – left-aligned, secondary.  
* “Send for Approval” – primary, right-aligned.

**Inline Validation:** Amount, Currency, and Category are required. Errors use helpful microcopy (e.g., "Category is missing") instead of error codes.

### **1.3 Payment Detail (Case View) – /payments/:id**

The Single Source of Truth, a 3-panel layout:

**Panel A – Header (top):**

* Title, Status pill, Amount & Currency (big typography).  
* Key highlights: Category, Due date, Requester.  
* **🔒 Silent Killer: One-Line Story Bar (Under Title)** (See 7.1).

**Panel B – Main Content (left / center):**

* Tabs or sections:  
  * **Overview (default):** Key facts and current status summary.  
  * **Details:** Full field list (editable only if state is DRAFT or REJECTED).  
  * **Slips & Documents:** Uploaded contextual docs and the final payment slip.

**Panel C – Timeline & Actions (right sidebar):**

* **Approval Progress (New):** Clear list showing the full approval chain, highlighting the current approver with an arrow (➡️).  
* **Action Buttons:** Contextually visible (e.g., Approve/Reject for approvers, Record Disbursement for Treasury).  
* **Timeline:** Vertical log of all audit events.  
* **Comments:** Discussion thread.

### **1.4 Approver View (Embedded into Detail) – /payments/:id?mode=approve**

When opened from the "Need My Approval" tab:

* **Focus Strip:** Pinned at the top: “You are reviewing this payment (MYR 12,500 for \[Category\]).”  
* **Panel C Fixation:** The right sidebar pins two large buttons:  
  * **Approve** (primary)  
  * **Reject** (secondary, opens reason dialog)  
* Below the buttons: comment box (Add a note to your decision).

### **1.5 Disbursement View – /payments/:id?mode=disburse**

When opened by Treasury/Finance:

* **Disbursement Card:** Pinned at the top of the main panel when status is APPROVED or DISBURSED\_AWAITING\_SLIP.  
  * Disbursement amount, Date, Method, Bank reference, Treasury account ref.  
* **Primary Action (State: APPROVED):** “Mark as Disbursed” → Sets status to DISBURSED\_AWAITING\_SLIP.  
* **Slip Upload Section (State: DISBURSED\_AWAITING\_SLIP):**  
  * “Drop your bank slip here or click to upload”  
  * Optional location\_ref input.  
  * Primary Action: “Complete Payment” → Sets status to COMPLETED.

## **2\. Primary Layout Pattern & Semantics**

**Status Pills (Refined):** | Status | Color (Semantic) | Description | | :--- | :--- | :--- | | **Draft** | Neutral (Gray) | Created but not submitted. | | **Under Review** | Info (Blue) | Submitted and awaiting approver decision. | | **Approved** | Success (Green) | Decision made; ready for payment. | | **Disbursed (Awaiting Slip)** | Warning (Orange) | Payment recorded; pending proof of payment. | | **Completed** | Strong Success (Teal) | Fully paid and audited with slip. (Terminal State) | | **Rejected** | Danger (Red) | Approval declined. |

## **3\. Flow 1 — Create & Submit Payment**

**3.3 Actions & Result:**

* **“Save as Draft”:** Toast: “Draft saved. Find it under My Requests.”  
* **“Send for Approval”:** Validates required fields, confirms, shows who will be notified. Redirects to Payment Detail in UNDER\_REVIEW status.  
* **Timeline:** Immediately shows “Payment created” and “Payment submitted for approval.”

## **4\. Flow 2 — Review / Approve / Reject**

**4.2 Detail View Behavior:**

* **Panel C (Approval Progress) is prominent:** It clearly shows the approver's name highlighted as the current step.

**4.3 Approve:**

* Click Approve → Confirmation dialog.  
* After success: Status updates to APPROVED. Timeline adds event: “Approved by \[Name\].”

**4.4 Reject:**

* Click Reject → Modal with required Textarea labeled “Reason for rejection.”  
* After success: Status updates to REJECTED. Timeline logs the reason. Requester receives notification.

## **5\. Flow 3 — Disburse & Upload Slip (Treasury)**

**5.2 Disbursement Form (State: APPROVED):**

* Treasury fills out the card fields (Amount, Date, Ref).  
* Action: **“Mark as Disbursed”**.  
* **Result:** Status updates to **DISBURSED\_AWAITING\_SLIP**.

**5.3 Slip Upload (State: DISBURSED\_AWAITING\_SLIP):**

* The upload zone becomes the primary focus.  
* User uploads slip and optionally inputs location\_ref.  
* Action: **“Complete Payment”**.  
* **Result:** Status updates to **COMPLETED** (Terminal State).  
* Timeline logs: “Slip uploaded by \[Name\] (location C12).”

## **6\. Flow 4 — Search, Filters & Audit**

**6.1 Search & Filter (on /payments):**

* Persistent search bar (title, payee, ref).  
* Filters: Status multi-select, Category, Amount range, Date range.

**6.2 Timeline-as-Audit:**

* Timeline is a fixed right sidebar in Payment Detail.  
* **Toggle: “Show technical view”** – Shows additional info like trace\_id tail, IP, and the full state object changes.

## **7\. Flow 5 (Refined) — Edit & Reset Approval**

This flow defines the critical state transitions when a Requester modifies a payment after submission.

**7.1 Editing a REJECTED Payment:**

1. **Action:** Requester clicks “Edit” on the Detail page.  
2. **State Change:** The payment remains in REJECTED status while the Requester is editing.  
3. **Form Focus:** The form fields are editable. If a rejection reason exists, relevant fields may be visually highlighted.  
4. **Re-Submission:** The primary button is **“Re-send for Approval.”**  
5. **Result:** Upon clicking this, the status changes to **UNDER\_REVIEW**, and the approval chain is **fully reset** (restarting at Step 1). Timeline logs: “Payment modified and re-submitted for approval.”

**7.2 Editing an UNDER\_REVIEW Payment:**

1. **Action:** Requester clicks “Edit.” A confirmation dialog appears: “Warning: Editing this payment will cancel the current approval process and reset the approval chain. Continue?”  
2. **State Change:** If confirmed, the status immediately changes to **DRAFT**.  
3. **Re-Submission:** The primary button changes to **“Send for Approval.”**  
4. **Result:** The payment must be explicitly submitted again, restarting the process.

## **8\. Silent Killer & Good-to-Haves**

### **8.1 🔒 Silent Killer: “One-Line Story Bar” in Header (SSOT Summary)**

**Location:** Panel A, under the Title/Amount.

**Content Example (Completed):**

“Requested by Jack on 12 Nov · Approved by Cindy (4 days later) · Paid 20 Nov · Slip uploaded · **Completed**.”

**Content Example (Awaiting Slip):**

“Approved by Cindy · Disbursed on 20 Nov · **Awaiting slip upload**.” (Amber Dot)

**Characteristics:**

* Auto-generated from the full audit history.  
* Changes in real time as the state updates.  
* **Color-coded dot:** Green (Completed), Amber (Awaiting a required action, e.g., slip), Red (Rejected).

### **8.2 ✅ Good-to-Have \#1: Multi-Step Approval Visualization (Panel C)**

**Location:** Top of Panel C (Timeline & Actions).

**Purpose:** To clearly communicate the progress through the approval chain.

| Status | Visualization |
| :---- | :---- |
| **UNDER\_REVIEW** | ✅ Cindy Lee (Approved) → ➡️ Thomas Chen (Awaiting Decision) → ⏳ Sarah Khan (Pending) |
| **APPROVED** | ✅ All Approvers (Shows sequence of approval completion) |

### **8.3 ✅ Good-to-Have \#2: Smart Empty States**

**My Requests (empty):**

“You haven’t requested any payments yet.” → Button: “Create your first payment request.”

**Need My Approval (empty):**

“Good news. Nothing needs your approval right now.” → Short tip: “You'll get notified here when colleagues send payments for your decision.”

**Ready to Disburse (empty):**

“No payments are ready to be disbursed.” → Tip: “Once approvals are complete, payments will appear here for Treasury to pay.”

## **9\. UX Definition of Done (MVP2)**

MVP2 Payment UI is Done when:

1. **Navigation & Lanes:** /payments has functional **My Requests**, **Need My Approval**, and **Ready to Disburse** lanes.  
2. **Detail View:** /payments/:id correctly displays the **One-Line Story Bar** that updates across all states (including the new DISBURSED\_AWAITING\_SLIP).  
3. **Core Flows:** User can Create → Approve/Reject → Record Disbursement (DISBURSED\_AWAITING\_SLIP) → Upload Slip (COMPLETED).  
4. **Approval Chain:** The **Approval Progress** section in the right sidebar correctly visualizes the current and future approvers.  
5. **Editing Guardrails:** Editing logic forces a required re-submission and approval reset for payments in the UNDER\_REVIEW or REJECTED state.  
6. **Traceability:** The Timeline reflects all state changes and actions, including the reason for rejection and location\_ref for slips.