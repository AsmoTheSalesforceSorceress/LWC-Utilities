import { LightningElement, api } from 'lwc';

export default class DynamicSearchablePicklists extends LightningElement {
    // Primary picklist variables
    @api primaryPicklistLabel; //Label for the primary picklist.
    @api primaryRequired; //Boolean. True if the primary picklist is required. Can also be used for validation logic.
    showPrimaryPicklist; //Boolean. True if the primary picklist dropdown should be displayed.
    noPrimaryOptionSelected = true; //Boolean. True if an option has NOT yet been selected in the primary picklist. While true, the secondary picklist is disabled.
    primaryOptions = []; //Array of objects. Each object should have a 'label' and 'value' property.
    _primaryValue = ''; //backing variable for primaryValue
    get primaryValue(){
        return this._primaryValue;
    }
    set primaryValue(selectedValue){
        if(selectedValue && selectedValue !== ''){
            this._primaryValue = selectedValue;
        }
    }
    // Secondary picklist variables
    @api secondaryPicklistLabel; //Label for the secondary picklist.
    @api secondaryRequired; //Boolean. True if the secondary picklist is required. Can also be used for validation logic.
    showSecondaryPicklist; //Boolean. True if the secondary picklist dropdown should be displayed.
    secondaryOptions = []; //Array of objects. Each object should have a 'label' and 'value' property.
    _secondaryValue = ''; //backing variable for secondaryValue
    get secondaryValue(){
        return this._secondaryValue;
    }
    set secondaryValue(selectedValue){
        if(selectedValue && selectedValue !== ''){
            this._secondaryValue = selectedValue;
        }
    }
    // General variables
    isListening = false; //Boolean. True if the component is listening for the onclick event.
    searchResults;
    activeDropdown; //Holds the currently active dropdown. Can be either 'primary' or 'secondary'.

    // Lifecycle hooks
    renderedCallback(){
        this.template.addEventListener('click', this.handleClickEvent.bind(this));
      }
    disconnectedCallback() {
        this.template.removeEventListener('click', this.handleClickEvent.bind(this));
    }

    handlePrimaryValueChange(){
        // If the primary value changes, reset the secondary value and enable the secondary picklist.
        if(this.primaryValue && this.primaryValue !== ''){
            this.secondaryValue = '';
            this.noPrimaryOptionSelected = false;
            // TODO: populate secondary picklist options based on primary value
            this.populateSecondaryPicklistOptions();
        }
    }

    handleSecondaryValueChange(){
        if(this.secondaryValue && this.secondaryValue !== ''){
            // handle any onchange logic here
        }
    }

    populatePrimaryPicklistOptions(){
        // reset primary options
        this.primaryOptions = [];
    }
    populateSecondaryPicklistOptions(){
        // reset secondary options
        this.secondaryOptions = [];
    }

    handleClickEvent(event){
        // if there isn't an active dropdown, do nothing
        if(!this.activeDropdown) return;
        // if there is an active dropdown but selectSearchResult isnt' being fired by the click, hide the dropdown
        //TODO: add logic to check if the click is within the active dropdown
        this.clearSearchResults();
    }

    showPicklistOptions(event){
        const priorActiveDropdown = this.activeDropdown;
        const dataId = event.currentTarget.dataset.id;
        this.activeDropdown = dataId;
        // if we are now clicking on a different dropdown, clear the search results
        if(priorActiveDropdown !== this.activeDropdown){
            this.clearSearchResults();
        }
        // populate dropdown options based on the selected dropdown
        if(!this.searchResults){
            if(dataId === 'primary'){
                this.searchResults = this.primaryOptions;
                this.showPrimaryPicklist = true;
            }else if(dataId === 'secondary'){
                this.searchResults = this.secondaryOptions;
                this.showSecondaryPicklist = true;
            }
        }
    }

    search(event){
        // get the search string entered
        const input = event.detail.value.toLowerCase();
        // get the id of the active dropdown being searched
        const dataId = event.target.dataset.id;
        let result;
        if(dataId === 'primary'){
            result = this.primaryOptions.filter(option => option.label.toLowerCase().includes(input));
        }else if(dataId === 'secondary'){
            result = this.secondaryOptions.filter(option => option.label.toLowerCase().includes(input));
        }
        this.searchResults = result;
    }

    selectSearchResult(event){
        const selectedValue = event.currentTarget.dataset.value;
        const dataId = event.currentTarget.dataset.id;
        // set the selected value to the appropriate picklist and handle the change
        if(this.activeDropdown === 'primary'){
            this.primaryValue = selectedValue;
            this.handlePrimaryValueChange();
        }else if(this.activeDropdown === 'secondary'){
            this.secondaryValue = selectedValue;
            this.handleSecondaryValueChange();
        }
        // once a value has been selected, hide the dropdown
        this.clearSearchResults();
    }

    clearSearchResults(){
        this.searchResults = null;
        this.showPrimaryPicklist = false;
        this.showSecondaryPicklist = false;
        this.activeDropdown = null;
    }
}