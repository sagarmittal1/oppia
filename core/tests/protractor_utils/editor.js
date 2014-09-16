// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating the exploration editor when
 * carrrying out end-to-end testing with protractor.
 *
 * @author Jacob Davis (jacobdavis11@gmail.com)
 */

objects = require('./objects.js');

// Content & non-interactive widgets. It is necessary to run open() at the
// start and close() at the end.
var editContent = function() {
  var operations = objects.editRichText(element(by.css('.oppia-state-content')));
  operations.open = function() {
    element(by.id('protractor-test-edit-content')).click();
  };
  operations.close = function() {
    element(by.css('.oppia-state-content')).element(by.buttonText('Close')).click();
  };
  return operations;
};


// Interactive widgets
var _openWidgetEditor = function(widgetIndex) {
  element(by.id('protractor-test-edit-interaction')).click();
  element(by.repeater('widget in widgetList').row(widgetIndex)).click();
};

var _closeWidgetEditor = function() {
  element(by.id('protractor-test-save-interaction')).click();
};

var selectNumericWidget = function() {
  _openWidgetEditor(2);
  _closeWidgetEditor();
};

var selectContinueWidget = function(buttonText) {
  _openWidgetEditor(0);
  if (buttonText) {
    element(by.linkText('Customize')).click();
    objects.editUnicode(element(by.id('protractor-test-widget-args'))).setText(buttonText);
  }
  _closeWidgetEditor();
};

var selectSimpleMultipleChoiceWidget = function(textArray) {
  _openWidgetEditor(1);
  element(by.linkText('Customize')).click();
  var editor = objects.editList(element(by.id('protractor-test-widget-args')));
  editor.editRichTextEntry(0).appendPlainText(textArray[0]);
  for (var i = 1; i < textArray.length; i++) {
    var newEntry = editor.appendEntry('Add multiple choice option');
    objects.editRichText(newEntry).appendPlainText(textArray[i]);
  }
  _closeWidgetEditor();
};


// Rules are zero-indexed; 'default' denotes the default rule.
var editRule = function(ruleNum) {
  var elem = (ruleNum === 'default') ?
    element(by.id('protractor-test-default-rule')):
    element(by.repeater('rule in handler track by $index').row(ruleNum));
  return {
    editFeedback: function() {
      return objects.editList(elem.element(by.css('.oppia-feedback-bubble')))
    },
    // Enter 'END' for the end state.
    setDestination: function(destinationName) {
      var destinationElement = elem.element(by.css('.oppia-dest-bubble'));
      destinationElement.element(by.tagName('button')).click();
      objects.editDropdown(destinationElement).sendText(destinationName);
    }
  }
};

// This must be run asynchronously; it will fail if no changes have been made.
var saveChanges = function(commitMessage) {
  return {
    then: function(subsequentFunction) {
      element(by.id('protractor-test-save-changes')).click().then(function() {
        if (commitMessage) {
          element(by.model('commitMessage')).sendKeys(commitMessage);
        }
        element(by.css('.modal-footer')).element(by.css('.btn-success')).
          click().then(function() {
            // This is necessary to give the page time to record the changes,
            // so that it does not attempt to stop the user leaving.
            protractor.getInstance().sleep(2000);
            subsequentFunction();
        });
      });
    }
  };
};

exports.editContent = editContent;

exports.selectNumericWidget = selectNumericWidget;
exports.selectContinueWidget = selectContinueWidget;
exports.selectSimpleMultipleChoiceWidget = selectSimpleMultipleChoiceWidget;

exports.editRule = editRule

exports.saveChanges = saveChanges;