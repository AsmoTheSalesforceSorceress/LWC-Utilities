# newRecordAnywhereUtility

## Overview
The `newRecordAnywhereUtility` Lightning Web Component (LWC) allows users to create new records from any record detail page using a Detail Page Button with a custom URL.

## Implementation

### Step 1: Create the Custom Button
1. Navigate to **Setup** in Salesforce.
2. Go to **Object Manager** and select the source object you want to add the button to.
3. Click on **Buttons, Links, and Actions**.
4. Click **New Button or Link**.
5. Fill in the details:
    - **Display Type**: Detail Page Button
    - **Behavior**: Display in existing window without sidebar or header
    - **Content Source**: URL
6. In the **URL** field, use the following syntax to provide parameters:
    ```
    /lightning/cmp/c__newRecordAnywhereUtility?c__recordId={!originObjectApiName.X18_digit_ID__c}&c__originObjectApiName=originObjectApiName&c__objectApiName=destinationObjectApiName&c__recordTypeName=destinationRecordTypeName&c__fieldMap={"originFieldApiName":"destinationFieldApiName"}&c__fieldValues={"destinationFieldApiName":"literalValue"}
    ```
   
   Here's what it looks like broken down into parts:
    - `/lightning/cmp/c__newRecordAnywhereUtility?` : Redirect to the component.
    - `c__recordId={!originObjectApiName.X18_digit_ID__c}` : **REQUIRED** Replace `originObjectApiName` with the source object's API name.
        - **NOTE**: "X18_digit_ID__c" cannot be replaced with "Id" or "recordId". It will only work with the 18-digit recordId.
    - `c__originObjectApiName=originObjectApiName` : **REQUIRED** Replace just the second `originObjectApiName` with the source object's API name.
    - `c__objectApiName=destinationObjectApiName` : **REQUIRED** Replace `destinationObjectApiName` with the destination object's API name.
    - `c__recordTypeName=destinationRecordTypeName` : *OPTIONAL* Replace `destinationRecordTypeName` with the desired Record Type Developer Name for the new record.
    - `c__fieldMap={"originFieldApiName":"destinationFieldApiName"}` : *OPTIONAL* Replace `originFieldApiName` with the API name of a field on the origin record and `destinationFieldApiName` with the API name of a field on the destination record to map them to each other. If the specified origin record field has a value, it will be autofilled on the destination record.
        - **NOTE**: If you want to map more than one pair, use a comma to separate pairs in the format:
            `{"originFieldApiName0":"destinationFieldApiName0", "originFieldApiName1":"destinationFieldApiName1"}`
    - `c__fieldValues={"destinationFieldApiName":"literalValue"}` : *OPTIONAL* Replace `destinationFieldApiName` with the API name of a field on the destination record and `literalValue` with the value you would like to be autofilled on the destination record.
        - **NOTE**: If you want to map more than one pair, use a comma to separate pairs in the format:
            `{"destinationFieldApiName0":"literalValue0", "destinationFieldApiName1":"literalValue1"}`

    For example, this URL:

    /lightning/cmp/c__newRecordAnywhereUtility?c__recordId={!Case.X18_digit_ID__c}&c__originObjectApiName=Case&c__objectApiName=Case&c__recordTypeName=Compliance&c__fieldMap={"AccountId":"AccountId", "ContactId":"ContactId", "Id":"Related_Inquiry__c"}&c__fieldValues={"Status":"New"}

    indicates that the button will be placed on a Case record and will create a new Case of record type "Compliance" with its AccountId, ContactId, and Related_Inquiry__c fields prepopulated such that the Account and Contact Ids match the origin Case and the Related Inquiry is set to the origin Case. The new Case will also have its Status prepopulated to "New".

### Step 2: Add the Button to the Page Layout or Lightning Record Page
- If you have upgraded to Dynamic Actions, add the Detail Page Button to the desired Lightning Record Page Highlights Panel.
    NOTE: This method also allows you to set visibility on the button via Set Action Visibility!
- If you have not upgraded to Dynamic Actions, add the Detail Page Button to the **Custom Buttons** section of the desired Page Layout.

### Step 3: Configure the Component
1. Ensure the `newRecordAnywhereUtility` component is deployed to your org.
2. The component will automatically handle the record creation process based on the provided parameters.

## Usage
Once setup is complete, users can click to open the `newRecordAnywhereUtility` component and create a new record.

## Notes
- Ensure that users have the necessary permissions to create records for the specified object.
- If a Record Type Name is specified, the new record form used will be that of the specified record type, including any field modifications specific to that record type.

## Support
For any issues or questions, contact Emilyn Pantelakis or the Product+ development team.