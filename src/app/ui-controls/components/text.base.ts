import { EventEmitter, Output, Input } from "@angular/core";

export class Textbase {
    @Output() textUpdated = new EventEmitter<any>();
    @Input() text: string;
    @Input() canEdit: boolean;

    @Input() styleClass: string;
    @Input() forceSave: boolean;

    textMemento: string;
    edit = false;
    onEdit() {
        this.textMemento = this.text;
        this.edit = true;
    }
    canSave = () => this.textMemento && this.textMemento.length > 0;
    onSave() {
        if (this.forceSave || this.canSave()) {
            this.textUpdated.emit({ original: this.text, updated: this.textMemento });
            this.edit = false;
        }
    }
    onCancel(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.textMemento = this.text;
        this.edit = false;
    }
}
