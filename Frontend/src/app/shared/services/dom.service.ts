import {ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, EventEmitter, Injectable, Injector} from '@angular/core';

@Injectable(
  {providedIn: 'root'}
)
export class DomService {
  private childComponentRef: any;
  private workingChild: String;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector) {
    this.workingChild = '';
  }

  public appendComponentTo(parentId: string, child: any, childConfig?: ChildConfig) {
    // Create a component reference from the component
    const childComponent = this.componentFactoryResolver.resolveComponentFactory(child);
    if (childComponent.componentType.name !== this.workingChild) {
      this.addComponent(parentId, child, childConfig);
      this.workingChild = childComponent.componentType.name;
    }
  }

  public removeComponent() {
    this.appRef.detachView(this.childComponentRef.hostView);
    this.childComponentRef.destroy();
    this.workingChild = '';
  }

  private attachConfig(config, componentRef) {
    const inputs = config.inputs;
    const outputs = config.outputs;
    for (const key in inputs) {
      componentRef.instance[key] = inputs[key];
    }
    for (const key in outputs) {
   //   componentRef.instance[key] = outputs[key];
      // subscribe to output event and invoke function
      // console.log(componentRef.instance[key], outputs[key]);
      if (componentRef.instance[key] instanceof EventEmitter) {
        componentRef.instance[key].subscribe(r => {
          outputs[key](r);
        });
      }
    }
  }

  private addComponent(parentId: string, childComponent: any, childConfig?: ChildConfig) {
    const childComponentRef = this.componentFactoryResolver
      .resolveComponentFactory(childComponent)
      .create(this.injector);
    // Check if a component is attached
    if (this.appRef.viewCount < 2) {
      // Attach the config to the child (inputs and outputs)
      this.attachConfig(childConfig, childComponentRef);
      this.childComponentRef = childComponentRef;
      // Attach component to the appRef so that it's inside the ng component tree
      this.appRef.attachView(childComponentRef.hostView);
      // Get DOM element from component
      const childDomElem = (childComponentRef.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;

      // Append DOM element to the body
      document.getElementById(parentId).appendChild(childDomElem);
    }
  }
}

interface ChildConfig {
  inputs: object;
  outputs: object;
}
