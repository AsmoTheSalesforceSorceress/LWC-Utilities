//** New Record Anywhere Utility **//
//
// PLEASE SEE README FOR INSTRUCTIONS ON HOW TO USE THIS COMPONENT. NO ADDITIONAL CODE CHANGES SHOULD BE NEEDED TO IMPLEMENT.
// Created date: 12/24
// Created by: Emilyn Pantelakis
//
import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class NewRecordOverride extends NavigationMixin(LightningElement) {
    // Source Object variables
    @api recordId;
    @api originObjectApiName; //REQUIRED. API name of the object to get the record data from
    originRecordData;
    fields = [];

    // Destination Object variables
    @api objectApiName; //REQUIRED. API name of the object to create a new record for
    @api recordTypeName; //Optional. Name of the record type to use for the new record
    recordTypeId; 
    @api fieldMap; //JSON object containing mappings of field API names in format originFieldAPIName:destinationFieldAPIName
    formattedFieldMap;
    @api fieldValues; //JSON object containing literal values for destination fields in format fieldAPIName:value
    newRecordData = {};

    // pageLoad flags
    isConnectedCallbackDone = false;
    isGetRecordDone = false;
    isGetObjectInfoDone = false;

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        // get values for all params passed in by URL
        this.recordId = this.pageRef.state.c__recordId;
        console.log('recordId:', this.recordId);
        this.originObjectApiName = this.pageRef.state.c__originObjectApiName;
        console.log('originObjectApiName:', this.originObjectApiName);
        this.objectApiName = this.pageRef.state.c__objectApiName;
        console.log('objectApiName:', this.objectApiName);
        this.recordTypeName = this.pageRef.state.c__recordTypeName;
        console.log('recordTypeName:', this.recordTypeName);
        this.fieldMap = JSON.parse(decodeURIComponent(this.pageRef.state.c__fieldMap));
        if(this.fieldMap){
            console.log('fieldMap:', this.fieldMap);
            // if any fieldMap values were provided, we need to get just the origin field API names and store them in the fields array in format "originObjectApiName.fieldApiName" to be used by getRecord
            for(let key in this.fieldMap){
                this.fields.push(this.originObjectApiName + '.' + key);
            }
            console.log('fields:', this.fields);
        }
        this.fieldValues = JSON.parse(decodeURIComponent(this.pageRef.state.c__fieldValues));
        console.log('fieldValues:', this.fieldValues);
        this.isConnectedCallbackDone = true;
        console.log('connectedCallbackDone:', this.isConnectedCallbackDone);
        this.checkIfReady();
    }

    // Use getRecord to return the record data for the origin record
    // requires: recordId, originObjectApiName, fields Array(originObjectApiName.fieldApiName)
    @wire(getRecord, { recordId: '$recordId', fields: '$fields' })
    originRecord({ data, error }) {
        if(data){
            this.originRecordData = data;
            this.isGetRecordDone = true;
            console.log('isGetRecordDone:', this.isGetRecordDone);
            this.checkIfReady();
        } else if(error){
            let message = "Unknown error";
            if (Array.isArray(error.body)) {
              message = error.body.map((e) => e.message).join(", ");
            } else if (typeof error.body.message === "string") {
              message = error.body.message;
            }
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Error during getRecord",
                message,
                variant: "error",
              }),
            );
        }
    }

    // Use getObjectInfo to return the record type id based on the record type name for the specified object
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo({ data, error }) {
        if (data) {
            // if a record type name was provided, get its recordTypeId
            const recordTypeName = this.recordTypeName; 
            if(recordTypeName){
                const recordTypeInfos = data.recordTypeInfos;
                this.recordTypeId = Object.keys(recordTypeInfos).find(
                    (key) => recordTypeInfos[key].name === recordTypeName
            );
        }
        this.isGetObjectInfoDone = true;
        console.log('recordTypeId:', this.recordTypeId);
        console.log('isGetObjectInfoDone:', this.isGetObjectInfoDone);
        this.checkIfReady();
        } else if (error) {
            console.error('Error fetching recordTypeId:', error);
        }
    }
    // verify everything is loaded in
    checkIfReady(){
        if(this.isConnectedCallbackDone && this.isGetRecordDone && this.isGetObjectInfoDone){
            console.log('All data loaded in');
            this.constructEncodedValues();
        }
    }

    // Construct new record edit page URL from newRecordData
    constructEncodedValues(){
        // if fieldMap is provided, format the values and merge them with newRecordData
        if(this.fieldMap != ''){
            this.formatFieldMapValues();
            // append formattedFieldMap to newRecordData
            this.newRecordData = {...this.newRecordData, ...this.formattedFieldMap};
        }
        // if fieldValues are provided, merge them with newRecordData
        if(this.fieldValues != ''){
            // append fieldValues to newRecordData
            this.newRecordData = {...this.newRecordData, ...this.fieldValues};
        }
        // encode the values to be passed as defaultFieldValues
        let defValues = encodeDefaultFieldValues(this.newRecordData);
        console.log('constructEncodedValues: newRecordData:', this.newRecordData);
        this.navigateToNewRecordEditPage(defValues);
    }

    // Navigates to new record edit page using NavigationMixin, passing in defaultFieldValues
    navigateToNewRecordEditPage(defValues){
        console.log('made it to navigateToNewRecordEditPage');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.objectApiName,
                actionName: 'new'
            },
            state: {
                defaultFieldValues: defValues,
                recordTypeId: this.recordTypeId
            }
        });
    }

    // gets values from origin and assigns them to destination fields
    formatFieldMapValues(){
        console.log('in formatFieldMapValues. fieldMap:', this.fieldMap);
        // const lastKey = Object.keys(this.fieldMap)[Object.keys(this.fieldMap).length - 1];
        // For each origin field in the fieldMap array, get the value from the origin record data and assign it to the destination field
        this.formattedFieldMap = {};
        for(let key in this.fieldMap){
            // format= {destinationField:originFieldValue}
            this.formattedFieldMap[this.fieldMap[key]] = this.originRecordData.fields[key].value;
        }
        console.log('formattedFieldMap:', this.formattedFieldMap);
    }
}