import React from 'react';
import Select from 'react-select';
import { HTMLDropdownOption } from './htmlDropdownOption'
import { HTMLDropdownSingleValue } from './htmlDropdownSingleValue'
import { CheckableDropdownOption } from './checkableDropdownOption'
import { CheckableDropdownValueContainer } from './checkableDropdownValueContainer'
import { StandardDropdownOption } from './standardDropdownOption'

interface DropdownInputProps {
  options: Array<any>;
  className?: string;
  disabled?: boolean;
  error?: string;
  handleCancel?: (event: any) => void;
  handleChange?: (selection: any|any[]) => void;
  helperText?: string;
  label?: string;
  id?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  onClick?: (event?: any) => void;
  optionType?: string;
  placeholder?: string;
  timesSubmitted?: Number;
  type?: string;
  usesCustomOption?: boolean;
  value?: string;
}

interface DropdownInputState {
  active: boolean;
  errorAcknowledged: boolean;
  menuIsOpen: boolean;
  options: Array<any>;
  cursor: number|null;
}

const KEYDOWN = 'keydown'
const MOUSEDOWN = 'mousedown'

export class DropdownInput extends React.Component<DropdownInputProps, DropdownInputState> {
  private input: any // eslint-disable-line react/sort-comp
  private node: any // eslint-disable-line react/sort-comp

  constructor(props) {
    super(props)

    const { options, isMulti, optionType, } = props

    const showAllOption = isMulti && optionType ? { label: `All ${optionType}s`, value: 'All' } : null
    const passedOptions = showAllOption ? [showAllOption].concat(options) : options

    this.state = {
      active: false,
      errorAcknowledged: false,
      menuIsOpen: false,
      options: passedOptions,
      cursor: null
    }
  }

  componentDidMount() {
    document.addEventListener(MOUSEDOWN, this.handleClick, true)
    document.addEventListener(KEYDOWN, this.handleKeyDown, true)
  }

  componentDidUpdate(_, prevState) {
    const { cursor, } = this.state

    if (cursor === null || cursor === prevState.cursor) { return }

    this.setOptionFocus()
  }

  componentWillReceiveProps(nextProps) {
    const { error, timesSubmitted, } = this.props
    const { errorAcknowledged, } = this.state
    if (nextProps.error !== error && errorAcknowledged) {
      this.setState({ errorAcknowledged: false, })
    } else if (nextProps.timesSubmitted !== timesSubmitted && nextProps.error && errorAcknowledged) {
      this.setState({ errorAcknowledged: false, })
    }
  }

  componentWillUnmount() {
    document.removeEventListener(MOUSEDOWN, this.handleClick, true)
    document.removeEventListener(KEYDOWN, this.handleClick, true)
  }

  handleInputActivation = () => {
    const { disabled, isSearchable, onClick, } = this.props
    const { active, menuIsOpen, } = this.state

    if (onClick) { onClick() }

    if (!disabled && (!menuIsOpen || !active)) {
      const cursor = isSearchable ? null : 0
      this.setState({ active: true, menuIsOpen: true, cursor }, () => { this.input ? this.input.focus() : null })
    }
  }

  setOptionFocus = () => {
    const { cursor, options, } = this.state

    const optionToFocus = options[cursor]
    const elementToFocus = optionToFocus ? document.getElementById(optionToFocus.value) : null
    elementToFocus ? elementToFocus.focus() : null
  }

  deactivateInput = () => {
    this.setState({ active: false, menuIsOpen: false, cursor: null })
  }

  handleClick = (e) => {
    if (!this.node || !this.node.contains(e.target)) {
      this.deactivateInput()
    }
  }

  updateCursor = (cursor) => {
    this.setState({ cursor: cursor })
  }

  handleErrorAcknowledgement = () => {
    this.setState({ errorAcknowledged: true, active: true, }, () => this.input ? this.input.focus() : null)
  }

  onKeyDown = (event) => {
    if (event.key === 'Tab') {
      this.deactivateInput()
    }
  }

  handleKeyDown = (e) => {
    const { active, menuIsOpen, cursor, options, } = this.state

    const inactiveNode = !(this.node && this.node.contains(e.target))
    const keyWasNotTab = e.key !== 'Tab'

    if (inactiveNode && keyWasNotTab) { return }

    switch (e.key) {
      case 'ArrowDown':
        if (cursor < options.length - 1) {
          this.setState(prevState => {
            if (prevState.cursor !== null) {
              return { cursor: prevState.cursor + 1 }
            }
            return { cursor: 0 }
          })
        }
        break
      case 'ArrowUp':
        this.setState(prevState => ({ cursor: Math.max(prevState.cursor - 1, 0) }))
        break
      case 'Tab':
        this.deactivateInput()
        break
      case 'Enter':
        e.preventDefault()
        if (!active || !menuIsOpen) {
          this.handleInputActivation()
        } else if (cursor !== null) {
          this.handleEnterWithFocusedOption()
        }
        break

      default:
        break
    }
  }

  handleEnterWithFocusedOption = () => {
    const { cursor, options, } = this.state
    const { value, isMulti, } = this.props

    const focusedOption = options[cursor]

    if (isMulti && Array.isArray(value)) {
      const valueWasPreviouslySelected = value.find(opt => opt.value === focusedOption.value)
      const newArray = valueWasPreviouslySelected ? value.filter(opt => opt.value === focusedOption.value) : value.concat(focusedOption)
      this.handleOptionSelection(newArray)
    } else {
      this.handleOptionSelection(focusedOption)
    }
  }

  renderHelperText() {
    const { helperText } = this.props
    if (helperText) {
      return <span className="helper-text">{helperText}</span>
    }
  }

  renderErrorText() {
    const { error } = this.props
    if (error) {
      return <span className="error-text">{error}</span>
    }
  }

  handleOptionSelection = (selection) => {
    const { options, } = this.props
    const { handleChange, value, isMulti, } = this.props
    const allWasClicked = Array.isArray(selection) && selection.find(opt => opt.value === 'All')

    if (allWasClicked) {
      if (value && value.length) {
        // if there are any selected, they should all get unselected
        handleChange([])
      } else {
        // if there are none selected, they should all get selected
        handleChange(options)
      }
    } else {
      handleChange(selection)
    }

    if (!isMulti) { this.deactivateInput() }
  }

  handleKeyDownOnInputContainer = (e) => {
    if (e.key === 'Tab') { return }
    this.handleInputActivation()
  }

  renderInput() {
    const { active, errorAcknowledged, menuIsOpen, cursor, options, } = this.state
    const { className, label, value, placeholder, error, type, id, isSearchable, isMulti, optionType, usesCustomOption, } = this.props
    const passedValue = value || ''
    const hasText = value || isMulti ? 'has-text' : ''
    const inactiveOrActive = active ? 'active' : 'inactive'
    const notEditable = isSearchable || isMulti ? '' : 'not-editable'
    const checkboxDropdown = isMulti ? 'checkbox-dropdown' : ''
    const sharedClasses = `dropdown-container input-container ${inactiveOrActive} ${hasText} ${notEditable} ${className} ${checkboxDropdown}`
    const sharedProps = {
      id,
      cursor,
      ref: (input) => { this.input = input; },
      value: passedValue,
      type,
      placeholder: placeholder || '',
      onKeyDown: this.onKeyDown,
      options,
      isClearable: false,
      className: "dropdown",
      classNamePrefix: "dropdown",
      isSearchable,
      updateCursor: this.updateCursor,
      components: { Option: StandardDropdownOption },
    }
    if (error) {
      if (errorAcknowledged) {
        return (
          <div
            className={`error ${sharedClasses}`}
            onClick={this.handleInputActivation}
            onKeyDown={this.handleKeyDownOnInputContainer}
            ref={node => this.node = node}
            role="button"
            tabIndex={0}
          >
            <label htmlFor={id}>{label}</label>
            <Select
              {...sharedProps}
              menuIsOpen={menuIsOpen}
              onChange={this.handleOptionSelection}
            />
          </div>)
      } else {
        return (
          <div
            className={`error unacknowledged ${sharedClasses}`}
            onClick={this.handleErrorAcknowledgement}
            onKeyDown={this.handleErrorAcknowledgement}
            ref={node => this.node = node}
            role="button"
            tabIndex={0}
          >
            <label htmlFor={id}>{label}</label>
            <Select
              {...sharedProps}
              menuIsOpen={false}
            />
            {this.renderErrorText()}
          </div>)
      }
    } else if (isMulti) {
      return (<div
        className={sharedClasses}
        onClick={this.handleInputActivation}
        onKeyDown={this.handleKeyDownOnInputContainer}
        ref={node => this.node = node}
        role="button"
        tabIndex={0}
      >
        <label htmlFor={id}>{label}</label>
        <Select
          {...sharedProps}
          closeMenuOnSelect={false}
          components={{ Option: CheckableDropdownOption, ValueContainer: CheckableDropdownValueContainer }}
          hideSelectedOptions={false}
          isMulti
          isSearchable={false}
          menuIsOpen={active ? menuIsOpen : false}
          onChange={this.handleOptionSelection}
          optionType={optionType}
        />
      </div>)
    } else if (usesCustomOption) {
      return (
        <div
          className={sharedClasses}
          onClick={this.handleInputActivation}
          onKeyDown={this.handleKeyDownOnInputContainer}
          ref={node => this.node = node}
          role="button"
          tabIndex={0}
        >
          <label htmlFor={id}>{label}</label>
          <Select
            {...sharedProps}
            components={{ SingleValue: HTMLDropdownSingleValue, Option: HTMLDropdownOption }}
            hideSelectedOptions={false}
            menuIsOpen={active ? menuIsOpen : false}
            onChange={this.handleOptionSelection}
          />
        </div>)
    } else if (!active) {
      return (
        <div
          className={`${sharedClasses}`}
          onClick={this.handleInputActivation}
          onKeyDown={this.handleKeyDownOnInputContainer}
          ref={node => this.node = node}
          role="button"
          tabIndex={0}
        >
          <label htmlFor={id}>{label}</label>
          <Select
            {...sharedProps}
            menuIsOpen={false}
          />
          {this.renderHelperText()}
        </div>
      )
    } else {
      return (
        <div
          className={`dropdown ${sharedClasses}`}
          onClick={this.handleInputActivation}
          onKeyDown={this.handleKeyDownOnInputContainer}
          ref={node => this.node = node}
          role="button"
          tabIndex={0}
        >
          <label htmlFor={id}>{label}</label>
          <Select
            {...sharedProps}
            menuIsOpen={menuIsOpen}
            onChange={this.handleOptionSelection}
          />
        </div>
      )
    }
  }

  render() {
    return this.renderInput()
  }
}
