import {
  BlockEventContext,
  RangedBlockEventContext,
  dispatchKeyEvent,
  PagesHandleMethods,
} from "@ohno-editor/core/system/handler";

export class ExamplePluginHandler implements PagesHandleMethods {
  handleKeyPress(
    e: KeyboardEvent,
    context: BlockEventContext
  ): boolean | void {}
  handleKeyDown(
    e: KeyboardEvent,
    context: RangedBlockEventContext
  ): boolean | void {
    return dispatchKeyEvent(this, e, context);
  }

  handleKeyUp(
    e: KeyboardEvent,
    context: RangedBlockEventContext
  ): boolean | void {
    return dispatchKeyEvent(this, e, context);
  }

  handleDeleteDown(
    e: KeyboardEvent,
    context: BlockEventContext
  ): boolean | void {}
  handleBackspaceDown(
    e: KeyboardEvent,
    context: BlockEventContext
  ): boolean | void {}

  handleEnterDown(
    e: KeyboardEvent,
    context: BlockEventContext
  ): boolean | void {}
  handleSpaceDown(
    e: KeyboardEvent,
    context: RangedBlockEventContext
  ): boolean | void {}

  handleBeforeInput(
    e: InputEvent,
    context: RangedBlockEventContext
  ): boolean | void {}
}
