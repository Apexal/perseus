import {
    components,
    icons,
    preprocessTex,
    Dependencies,
    Errors,
    Log,
    PerseusError,
    PerseusMarkdown,
    Util,
    Widgets,
    WIDGET_PROP_DENYLIST,
} from "@khanacademy/perseus";
import $ from "jquery";
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import katex from "katex";
import * as React from "react";
import * as ReactDOM from "react-dom";
import _ from "underscore";

import DragTarget from "./components/drag-target";
import KatexErrorView from "./katex-error-view";
import SectionControlButton from "./section-control-button";

import type {Alignment, ChangeHandler, WidgetInfo} from "@khanacademy/perseus";

const {InlineIcon, PropCheckBox} = components;
const {iconChevronDown, iconChevronRight, iconTrash} = icons;

// like [[snowman input-number 1]]
const widgetPlaceholder = "[[\u2603 {id}]]";
const widgetRegExp = "(\\[\\[\u2603 {id}\\]\\])";
const rWidgetSplit = new RegExp(
    widgetRegExp.replace("{id}", "[a-z-]+ [0-9]+"),
    "g",
);

const shortcutRegexp = /^\[\[([a-z-]+)$/; // like [[nu, [[int, etc

const ENDS_WITH_A_PARAGRAPH = /(?:\n{2,}|^\n*)$/;
const TRAILING_NEWLINES = /(\n*)$/;
const LEADING_NEWLINES = /^(\n*)/;

const commafyInteger = (n: number) => {
    let str = n.toString();
    if (str.length >= 5) {
        str = str.replace(/(\d)(?=(\d{3})+$)/g, "$1{,}");
    }
    return str;
};
const makeEndWithAParagraphIfNecessary = (content: string) => {
    if (!ENDS_WITH_A_PARAGRAPH.test(content)) {
        const match = TRAILING_NEWLINES.exec(content);
        if (match) {
            const newlines = match[1];
            return content + "\n\n".slice(0, 2 - newlines.length);
        }
    }
    return content;
};
const makeStartWithAParagraphAlways = (content) => {
    const match = LEADING_NEWLINES.exec(content);
    if (!match) {
        return content;
    }
    const newlines = match[1];
    return "\n\n".slice(0, 2 - newlines.length) + content;
};

type WidgetSelectProps = {
    onChange?: (widgetType: string) => unknown;
};

class WidgetSelect extends React.Component<WidgetSelectProps> {
    shouldComponentUpdate() {
        return false;
    }

    handleChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
        const widgetType = e.currentTarget.value;
        if (widgetType === "") {
            // TODO(alpert): Not sure if change will trigger here
            // but might as well be safe
            return;
        }
        if (this.props.onChange) {
            this.props.onChange(widgetType);
        }
    };

    render(): React.ReactElement {
        const widgets = Widgets.getPublicWidgets();
        const orderedWidgetNames = _.sortBy(_.keys(widgets), (name) => {
            return widgets[name].displayName;
        });
        const addWidgetString = "Add a widget\u2026";
        return (
            <select value="" onChange={this.handleChange}>
                <option value="">{addWidgetString}</option>
                <option disabled>--</option>
                {_.map(orderedWidgetNames, (name) => {
                    return (
                        <option key={name} value={name}>
                            {widgets[name].displayName}
                        </option>
                    );
                })}
            </select>
        );
    }
}

type WidgetEditorProps = {
    // Unserialized props
    id: string;
    onChange: (
        widgetInfo: WidgetInfo,
        cb?: () => unknown,
        silent?: boolean,
    ) => unknown;
    onRemove: () => unknown;
    apiOptions: any;
} & WidgetInfo;

type WidgetEditorState = {
    showWidget: boolean;
    widgetInfo: WidgetInfo;
};

const _upgradeWidgetInfo: React.FC<WidgetEditorProps> = (
    props,
): React.ReactElement => {
    // We can't call serialize here because this.refs.widget
    // doesn't exist before this component is mounted.
    const filteredProps = _.omit(props, WIDGET_PROP_DENYLIST);
    // @ts-expect-error [FEI-5003] - TS2322 - Type 'PerseusWidget' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>>'. | TS2345 - Argument of type 'Partial<{ id: string; onChange: (widgetInfo: PerseusWidget, cb?: (() => unknown) | undefined, silent?: boolean | undefined) => unknown; onRemove: () => unknown; apiOptions: any; } & CategorizerWidget & { ...; }> | ... 38 more ... | Partial<...>' is not assignable to parameter of type 'PerseusWidget'.
    return Widgets.upgradeWidgetInfoToLatestVersion(filteredProps);
};

// This component handles upgading widget editor props via prop
// upgrade transforms. Widget editors will always be rendered
// with all available transforms applied, but the results of those
// transforms will not be propogated upwards until serialization.
// eslint-disable-next-line react/no-unsafe
class WidgetEditor extends React.Component<
    WidgetEditorProps,
    WidgetEditorState
> {
    constructor(props: WidgetEditorProps) {
        super(props);
        this.state = {
            showWidget: false,
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'ReactElement<any, any> | null' is not assignable to type 'PerseusWidget'.
            widgetInfo: _upgradeWidgetInfo(props),
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: WidgetEditorProps) {
        // @ts-expect-error [FEI-5003] - TS2322 - Type 'ReactElement<any, any> | null' is not assignable to type 'PerseusWidget'.
        this.setState({widgetInfo: _upgradeWidgetInfo(nextProps)});
    }

    _toggleWidget = (e: React.SyntheticEvent) => {
        e.preventDefault();
        this.setState({showWidget: !this.state.showWidget});
    };

    _handleWidgetChange = (
        newProps: WidgetEditorProps,
        cb: () => unknown,
        silent: boolean,
    ) => {
        const newWidgetInfo = Object.assign(
            {},
            this.state.widgetInfo,
        ) as WidgetInfo;
        newWidgetInfo.options = Object.assign(
            // eslint-disable-next-line react/no-string-refs
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'serialize' does not exist on type 'ReactInstance'.
            this.refs.widget.serialize(),
            newProps,
        );
        this.props.onChange(newWidgetInfo, cb, silent);
    };

    _toggleStatic = (e: Event) => {
        e.preventDefault();
        const newWidgetInfo = Object.assign({}, this.state.widgetInfo, {
            static: !this.state.widgetInfo.static,
        }) as WidgetInfo;
        this.props.onChange(newWidgetInfo);
    };

    _handleAlignmentChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
        const newAlignment = e.currentTarget.value as Alignment;
        const newWidgetInfo = Object.assign(
            {},
            this.state.widgetInfo,
        ) as WidgetInfo;
        newWidgetInfo.alignment = newAlignment;
        this.props.onChange(newWidgetInfo);
    };

    getSaveWarnings = () => {
        // eslint-disable-next-line react/no-string-refs
        // @ts-expect-error [FEI-5003] - TS2339 - Property 'getSaveWarnings' does not exist on type 'ReactInstance'.
        const issuesFunc = this.refs.widget.getSaveWarnings;
        return issuesFunc ? issuesFunc() : [];
    };

    serialize = () => {
        // TODO(alex): Make this properly handle the case where we load json
        // with a more recent widget version than this instance of Perseus
        // knows how to handle.
        const widgetInfo = this.state.widgetInfo;
        return {
            type: widgetInfo.type,
            alignment: widgetInfo.alignment,
            static: widgetInfo.static,
            graded: widgetInfo.graded,
            // eslint-disable-next-line react/no-string-refs
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'serialize' does not exist on type 'ReactInstance'.
            options: this.refs.widget.serialize(),
            version: widgetInfo.version,
        };
    };

    render(): React.ReactElement {
        const widgetInfo = this.state.widgetInfo;

        const Ed = Widgets.getEditor(widgetInfo.type);
        let supportedAlignments: ReadonlyArray<Alignment>;
        if (this.props.apiOptions.showAlignmentOptions) {
            supportedAlignments = Widgets.getSupportedAlignments(
                widgetInfo.type,
            );
        } else {
            // NOTE(kevinb): "default" is not one in `validAlignments` in widgets.js.
            supportedAlignments = ["default"];
        }

        const supportsStaticMode = Widgets.supportsStaticMode(widgetInfo.type);

        const isUngradedEnabled = widgetInfo.type === "transformer";
        const gradedPropBox = (
            <PropCheckBox
                label="Graded:"
                graded={widgetInfo.graded}
                onChange={this.props.onChange}
            />
        );

        return (
            <div className="perseus-widget-editor">
                <div
                    className={
                        "perseus-widget-editor-title " +
                        (this.state.showWidget ? "open" : "closed")
                    }
                >
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                        className="perseus-widget-editor-title-id"
                        href="#"
                        onClick={this._toggleWidget}
                    >
                        {this.props.id}
                        {this.state.showWidget ? (
                            <InlineIcon {...iconChevronDown} />
                        ) : (
                            <InlineIcon {...iconChevronRight} />
                        )}
                    </a>

                    {supportsStaticMode && (
                        <input
                            type="button"
                            // @ts-expect-error [FEI-5003] - TS2322 - Type '(e: Event) => void' is not assignable to type 'MouseEventHandler<HTMLInputElement>'.
                            onClick={this._toggleStatic}
                            className="simple-button--small"
                            value={
                                widgetInfo.static
                                    ? "Unset as static"
                                    : "Set as static"
                            }
                        />
                    )}
                    {supportedAlignments.length > 1 && (
                        <select
                            className="alignment"
                            value={widgetInfo.alignment}
                            onChange={this._handleAlignmentChange}
                        >
                            {supportedAlignments.map((alignment) => (
                                <option key={alignment}>{alignment}</option>
                            ))}
                        </select>
                    )}
                    <SectionControlButton
                        icon={iconTrash}
                        onClick={() => {
                            this.props.onRemove();
                        }}
                        title="Remove image widget"
                    />
                </div>
                <div
                    className={
                        "perseus-widget-editor-content " +
                        (this.state.showWidget ? "enter" : "leave")
                    }
                >
                    {isUngradedEnabled && gradedPropBox}
                    {Ed && (
                        <Ed
                            // eslint-disable-next-line react/no-string-refs
                            ref="widget"
                            onChange={this._handleWidgetChange}
                            static={widgetInfo.static}
                            apiOptions={this.props.apiOptions}
                            {...widgetInfo.options}
                        />
                    )}
                </div>
            </div>
        );
    }
}

// This is more general than the actual markdown image parsing regex,
// which is fine for correctness since it should only mean we could
// store extra image dimensions, unless the question is insanely
// formatted.
// A simplified regex here should hopefully be easier to keep in
// sync if the markdown parsing changes, though if it becomes
// easy to hook into the actual markdown regex without copy-pasting
// it, we should do that.
const IMAGE_REGEX = /!\[[^\]]*\]\(([^\s)]+)[^)]*\)/g;

/**
 * Find all the matches to a /g regex.
 *
 * Returns an array of the regex matches. Infinite loops if `regex` does not
 * have a /g modifier.
 *
 * Note: Returns an array of the capture objects, whereas String::match
 * ignores captures. If you don't need captures, use String::match
 */
const allMatches = function (regex: RegExp, str: string) {
    // @ts-expect-error [FEI-5003] - TS2702 - 'RegExp' only refers to a type, but is being used as a namespace here.
    const result: Array<any | RegExp.matchResult> = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const match = regex.exec(str);
        if (!match) {
            break;
        }
        result.push(match);
    }
    return result;
};

/**
 * Return an array of URLs of all the images in the given renderer
 * markdown.
 */
const imageUrlsFromContent = function (content: string) {
    return _.map(allMatches(IMAGE_REGEX, content), (capture) => capture[1]);
};

type EditorProps = Readonly<{
    apiOptions: any;
    className?: string;
    content: string;
    replace?: any;
    placeholder: string;
    widgets: {
        [name: string]: WidgetInfo;
    };
    images: any;
    disabled: boolean;
    widgetEnabled: boolean;
    immutableWidgets: boolean;
    showWordCount: boolean;
    warnNoPrompt: boolean;
    warnNoWidgets: boolean;
    imageUploader?: (
        file: string,
        callback: (url: string) => unknown,
    ) => unknown;
    onChange: ChangeHandler;
}>;

type DeafultProps = {
    content: string;
    disabled: boolean;
    images: Record<any, any>;
    immutableWidgets: boolean;
    placeholder: string;
    showWordCount: boolean;
    warnNoPrompt: boolean;
    warnNoWidgets: boolean;
    widgetEnabled: boolean;
    widgets: {
        [name: string]: WidgetInfo;
    };
};

type EditorState = {
    showKatexErrors: boolean;
    textAreaValue: string;
    katex?: katex;
};

// eslint-disable-next-line react/no-unsafe
class Editor extends React.Component<EditorProps, EditorState> {
    lastUserValue: string | null | undefined;
    deferredChange: any | null | undefined;
    widgetIds: any | null | undefined;

    static defaultProps: DeafultProps = {
        content: "",
        placeholder: "",
        widgets: {},
        images: {},
        disabled: false,
        widgetEnabled: true,
        immutableWidgets: false,
        showWordCount: false,
        warnNoPrompt: false,
        warnNoWidgets: false,
    };

    state: EditorState = {
        katex: undefined,
        showKatexErrors: false,
        textAreaValue: this.props.content,
    };

    componentDidMount() {
        // See componentDidUpdate() for how this flag is used
        this.lastUserValue = null;

        // This can't be in componentWillMount because that's happening during
        // the middle of our parent's render, so we can't call
        // this.props.onChange during that, since it calls our parent's
        // setState
        this._sizeImages(this.props);
        // eslint-disable-next-line react/no-string-refs
        // @ts-expect-error [FEI-5003] - TS2769 - No overload matches this call.
        $(ReactDOM.findDOMNode(this.refs.textarea))
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'on' does not exist on type 'JQueryStatic'.
            .on("copy cut", this._maybeCopyWidgets)
            .on("paste", this._maybePasteWidgets);

        Dependencies.getDependencies()
            .getKaTeX()
            .then((katex) => {
                this.setState({
                    katex,
                });
            });
    }

    // TODO(arun): This is a deprecated method, use the appropriate replacement
    UNSAFE_componentWillReceiveProps(nextProps: EditorProps) {
        if (this.props.content !== nextProps.content) {
            this.setState({textAreaValue: nextProps.content});
        }
    }

    componentDidUpdate(prevProps: EditorProps) {
        // TODO(alpert): Maybe fix React so this isn't necessary
        // eslint-disable-next-line react/no-string-refs
        const textarea = ReactDOM.findDOMNode(this.refs.textarea);

        // Slightly unorthodox method to ensure that programmatic text changes
        // are in the browser's undo stack.
        // See https://stackoverflow.com/questions/41273569/how-to-enable-ctrl-z-when-you-change-an-input-text-dynamically-with-react
        // Note: On unsupported browsers (*cough* Firefox *cough*) `execCommand`
        // will return false. However at least in Firefox setting `value` on a
        // textbox clears the undo stack so we don't get unexpected undo
        // behavior.
        if (this.lastUserValue !== null && textarea) {
            /**
             * TODO(somewhatabstract, JIRA-XXXX):
             * textarea should be refined with an instanceof check to
             * HTMLTextAreaElement so that these props are available.
             */
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'focus' does not exist on type 'Element | Text'.
            textarea.focus();
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'value' does not exist on type 'Element | Text'.
            textarea.value = this.lastUserValue;
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'selectionStart' does not exist on type 'Element | Text'.
            textarea.selectionStart = 0;
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'select' does not exist on type 'Element | Text'.
            textarea.select(0, prevProps.content.length);
            if (
                document.execCommand(
                    "insertText",
                    false,
                    this.props.content,
                ) === false
            ) {
                // This command is not implemented. Fall back to setting `value`
                // directly.
                // @ts-expect-error [FEI-5003] - TS2339 - Property 'value' does not exist on type 'Element | Text'.
                textarea.value = this.props.content;
            }
            this.lastUserValue = null;
        }

        // This can't be in componentWillReceiveProps because that's happening
        // during the middle of our parent's render.
        if (this.props.content !== prevProps.content) {
            this._sizeImages(this.props);
        }
    }

    componentWillUnmount() {
        // TODO(jeff, CP-3128): Use Wonder Blocks Timing API.
        // eslint-disable-next-line no-restricted-syntax
        clearTimeout(this.deferredChange);
    }

    getWidgetEditor: (id: string, type: string) => undefined | React.ReactNode =
        (id: string, type: string) => {
            if (!Widgets.getEditor(type)) {
                return;
            }
            return (
                <WidgetEditor
                    // @ts-expect-error [FEI-5003] - TS2322 - Type 'string' is not assignable to type 'number | undefined'.
                    key={id}
                    ref={id}
                    id={id}
                    // @ts-expect-error [FEI-5003] - TS2783 - 'type' is specified more than once, so this usage will be overwritten.
                    type={type}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={this._handleWidgetEditorChange.bind(this, id)}
                    // eslint-disable-next-line react/jsx-no-bind
                    onRemove={this._handleWidgetEditorRemove.bind(this, id)}
                    apiOptions={this.props.apiOptions}
                    {...this.props.widgets[id]}
                />
            );
        };

    _handleWidgetEditorChange: (
        id: string,
        newWidgetInfo: WidgetInfo,
        cb?: () => unknown,
        silent?: boolean,
    ) => void = (
        id: string,
        newWidgetInfo: WidgetInfo,
        cb?: () => unknown,
        silent?: boolean,
    ) => {
        const widgets = Object.assign({}, this.props.widgets);
        widgets[id] = Object.assign({}, widgets[id], newWidgetInfo);
        this.props.onChange({widgets}, cb, silent);
    };

    _handleWidgetEditorRemove: (id: string) => void = (id: string) => {
        // eslint-disable-next-line react/no-string-refs
        const textarea = this.refs.textarea;
        const re = new RegExp(widgetRegExp.replace("{id}", id), "gm");
        // @ts-expect-error [FEI-5003] - TS2339 - Property 'value' does not exist on type 'ReactInstance'.
        this.props.onChange({content: textarea.value.replace(re, "")});
    };

    /**
     * Calculate the size of all the images in props.content, and send
     * those sizes to this.props.images using props.onChange.
     */
    _sizeImages: (props: EditorProps) => void = (props: EditorProps) => {
        const imageUrls = imageUrlsFromContent(props.content);

        // Discard any images in our dimension table that no
        // longer exist in content.
        const images = _.pick(props.images, imageUrls);

        // Only calculate sizes for images that were not present previously.
        // Most content edits shouldn't have new images.
        // This could get weird in the case of multiple images with the same
        // URL, if you've changed the backing image size, but given graphie
        // hashes it's probably an edge case.
        const newImageUrls = _.filter(imageUrls, (url) => !images[url]);

        // TODO(jack): Q promises would make this nicer and only
        // fire once.
        _.each(newImageUrls, (url) => {
            Util.getImageSize(url, (width, height) => {
                // We keep modifying the same image object rather than a new
                // copy from this.props because all changes here are additive.
                // Maintaining old changes isn't strictly necessary if
                // props.onChange calls are not batched, but would be if they
                // were, so this is nice from that anti-race-condition
                // perspective as well.
                images[url] = {
                    width: width,
                    height: height,
                };
                props.onChange(
                    {
                        images: _.clone(images),
                    },
                    // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'null' is not assignable to parameter of type '(() => unknown) | undefined'.
                    null, // callback
                    true, // silent
                );
            });
        });
    };

    handleDrop: (e: DragEvent) => void = (e: DragEvent) => {
        const {imageUploader} = this.props;
        let content = this.state.textAreaValue || "";
        const dataTransfer = e.dataTransfer;

        if (!dataTransfer || !imageUploader) {
            return;
        }

        // files will hold something if the drag was from the desktop or a file
        // located on the user's computer.
        const files = dataTransfer.files;

        // ... but we only get a url if the drag originated in another window
        if (files.length === 0) {
            const imageUrl = dataTransfer.getData("URL");

            if (imageUrl) {
                // TODO(joel) - relocate when the image upload dialog lands
                const newContent = content + "\n\n![](" + imageUrl + ")";
                // See componentDidUpdate() for how this flag is used
                this.lastUserValue = this.props.content;
                this.props.onChange({content: newContent});
            }

            return;
        }

        const origContent = this.state.textAreaValue;

        /* For each file we make sure it's an image, then create a sentinel -
         * snowman + identifier to insert into the current text. The sentinel
         * only lives there temporarily until we get a response back from the
         * server that the image is now hosted on AWS, at which time we replace
         * the temporary sentinel with the permanent url for the image.
         *
         * There is an abuse of tap in the middle of the pipeline to make sure
         * everything is sequenced in the correct order. We want to modify the
         * content (given any number of images) at the same time, i.e. only
         * once, so we do that step with the tap. After the content has been
         * changed we send off the request for each image.
         *
         * Note that the snowman doesn't do anything special in this case -
         * it's effectively just part of a broken link. Perseus could be
         * extended to recognize this sentinel and highlight it like for
         * widgets.
         */
        _(files)
            .chain()
            .map(function (file) {
                if (!file.type.match("image.*")) {
                    return null;
                }

                const sentinel = "\u2603 " + _.uniqueId("image_");
                // TODO(joel) - figure out how to temporarily include the image
                // before the server returns.
                content += "\n\n![](" + sentinel + ")";

                return {file: file, sentinel: sentinel};
            })
            .reject(_.isNull)
            .tap(() => {
                // See componentDidUpdate() for how this flag is used
                this.lastUserValue = origContent;
                this.props.onChange({content: content});
            })
            .each((fileAndSentinel) => {
                // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'. | TS2345 - Argument of type 'File' is not assignable to parameter of type 'string'.
                imageUploader(fileAndSentinel.file, (url) => {
                    // See componentDidUpdate() for how this flag is used
                    this.lastUserValue = origContent;
                    this.props.onChange({
                        content: this.state.textAreaValue.replace(
                            // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
                            fileAndSentinel.sentinel,
                            url,
                        ),
                    });
                });
            });
    };

    handleChange: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void = (
        e: React.SyntheticEvent<HTMLTextAreaElement>,
    ) => {
        // TODO(jeff, CP-3128): Use Wonder Blocks Timing API.
        // eslint-disable-next-line no-restricted-syntax
        clearTimeout(this.deferredChange);
        this.setState({textAreaValue: e.currentTarget.value});
        // TODO(jeff, CP-3128): Use Wonder Blocks Timing API.
        // eslint-disable-next-line no-restricted-syntax
        this.deferredChange = setTimeout(() => {
            if (this.state.textAreaValue !== this.props.content) {
                this.props.onChange({content: this.state.textAreaValue});
            }
        }, this.props.apiOptions.editorChangeDelay);
    };

    _handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        e.stopPropagation();
        // Tab-completion of widgets. For example, to insert an image:
        // type `[[im`, then tab.
        if (e.key === "Tab") {
            // eslint-disable-next-line react/no-string-refs
            const textarea = ReactDOM.findDOMNode(this.refs.textarea);

            // findDOMNode can also return Text, but we know it's an element.
            // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'Element | Text | null' is not assignable to parameter of type 'HTMLTextAreaElement'.
            const word = Util.textarea.getWordBeforeCursor(textarea);
            const matches = word.string.toLowerCase().match(shortcutRegexp);

            if (matches != null) {
                const text = matches[1];
                const widgets = Widgets.getAllWidgetTypes();
                const matchingWidgets = _.filter(widgets, (name) => {
                    return name.substring(0, text.length) === text;
                });

                if (matchingWidgets.length === 1) {
                    const widgetType = matchingWidgets[0];

                    this._addWidgetToContent(
                        this.props.content,
                        [word.pos.start, word.pos.end + 1],
                        widgetType,
                    );
                }

                e.preventDefault();
            }
        }
    };

    _maybeCopyWidgets: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void =
        (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
            // If there are widgets being cut/copied, put the widget JSON in
            // localStorage.perseusLastCopiedWidgets to allow copy-pasting of
            // widgets between Editors. Also store the text to be pasted in
            // localStorage.perseusLastCopiedText since we want to know if the user
            // is actually pasting something originally from Perseus later.
            const textarea = e.currentTarget;
            const selectedText = textarea.value.substring(
                textarea.selectionStart,
                textarea.selectionEnd,
            );

            const widgetNames = _.map(
                // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'RegExpMatchArray | null' is not assignable to parameter of type 'Collection<any>'.
                selectedText.match(rWidgetSplit),
                (syntax) => {
                    // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
                    return Util.rWidgetParts.exec(syntax)[1];
                },
            );

            const widgetData = _.pick(this.serialize().widgets, widgetNames);

            localStorage.perseusLastCopiedText = selectedText;
            localStorage.perseusLastCopiedWidgets = JSON.stringify(widgetData);

            Log.log(`Widgets copied: ${localStorage.perseusLastCopiedWidgets}`);
        };

    _maybePasteWidgets: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void =
        (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
            // Use the data from localStorage to paste any widgets we copied
            // before. Avoid name conflicts by renumbering pasted widgets so that
            // their numbers are always higher than the highest numbered widget of
            // their type.
            // TODO(sam): Fix widget numbering in the widget editor titles

            const widgetJSON = localStorage.perseusLastCopiedWidgets;
            const lastCopiedText = localStorage.perseusLastCopiedText;
            const textToBePasted =
                // @ts-expect-error [FEI-5003] - TS2339 - Property 'originalEvent' does not exist on type 'SyntheticEvent<HTMLTextAreaElement, Event>'.
                e.originalEvent.clipboardData.getData("text");

            // Only intercept if we have widget data to paste and the user is
            // pasting something originally from Perseus.
            // TODO(sam/aria/alex): Make it so that you can paste arbitrary text
            // (e.g. from a text editor) instead of exactly what was copied, and
            // let the widgetJSON match up with it. This would let you copy text
            // into a buffer, perform complex operations on it, then paste it back.
            if (widgetJSON && lastCopiedText === textToBePasted) {
                e.preventDefault();

                const widgetData = JSON.parse(widgetJSON);
                const safeWidgetMapping =
                    this._safeWidgetNameMapping(widgetData);

                // Use safe widget name map to construct the new widget data
                // TODO(aria/alex): Don't use `rWidgetSplit` or other piecemeal
                // regexes directly; abstract this out so that we don't have to
                // worry about potential edge cases.
                const safeWidgetData: Record<string, any> = {};
                for (const [key, data] of Object.entries(widgetData)) {
                    safeWidgetData[safeWidgetMapping[key]] = data;
                }
                const newWidgets = _.extend(safeWidgetData, this.props.widgets);

                // Use safe widget name map to construct new text
                const safeText = lastCopiedText.replace(
                    rWidgetSplit,
                    (syntax) => {
                        const match = Util.rWidgetParts.exec(syntax);
                        // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
                        const completeWidget = match[0];
                        // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
                        const widget = match[1];
                        return completeWidget.replace(
                            widget,
                            safeWidgetMapping[widget],
                        );
                    },
                );

                // Add pasted text to previous content, replacing selected text to
                // replicate normal paste behavior.
                const textarea = e.currentTarget;
                const selectionStart = textarea.selectionStart;
                const newContent =
                    this.state.textAreaValue.substr(0, selectionStart) +
                    safeText +
                    this.state.textAreaValue.substr(textarea.selectionEnd);

                // See componentDidUpdate() for how this flag is used
                this.lastUserValue = this.state.textAreaValue;
                this.props.onChange(
                    {content: newContent, widgets: newWidgets},
                    () => {
                        const expectedCursorPosition =
                            selectionStart + safeText.length;
                        Util.textarea.moveCursor(
                            textarea,
                            expectedCursorPosition,
                        );
                    },
                );
            }
        };

    _safeWidgetNameMapping: (widgetData: {
        [name: string]: any;
    }) => Record<any, any> = (widgetData: {[name: string]: any}) => {
        // Helper function for _maybePasteWidgets.
        // For each widget about to be pasted, construct a mapping from
        // old widget name to a new widget name that doesn't have conflicts
        // with widgets already in the editor.
        // eg. If there is an "image 2" already present in the editor and we're
        // about to paste in two new images, return
        // { "image 1": "image 3", "image 2": "image 4" }

        // List of widgets about to be pasted as [[name, number], ...]
        const widgets = _.keys(widgetData).map((name) => name.split(" "));
        const widgetTypes = _.uniq(widgets.map((widget) => widget[0]));

        // List of existing widgets as [[name, number], ...]
        const existingWidgets = _.keys(this.props.widgets).map((name) =>
            name.split(" "),
        );

        // Mapping of widget type to a safe (non-conflicting) number
        // eg. { "image": 2, "dropdown": 1 }
        const safeWidgetNums: Record<string, any> = {};
        _.each(widgetTypes, (type) => {
            safeWidgetNums[type] = _.chain(existingWidgets)
                .filter((existingWidget) => existingWidget[0] === type)
                .map((existingWidget) => +existingWidget[1] + 1)
                .max()
                .value();
            // If there are no existing widgets _.max returns -Infinity
            safeWidgetNums[type] = Math.max(safeWidgetNums[type], 1);
        });

        // Construct mapping, incrementing the vals in safeWidgetNums as we go
        const safeWidgetMapping: Record<string, any> = {};
        _.each(widgets, (widget) => {
            const widgetName = widget.join(" ");
            const widgetType = widget[0];

            safeWidgetMapping[
                widgetName
            ] = `${widgetType} ${safeWidgetNums[widgetType]}`;
            safeWidgetNums[widgetType]++;
        });

        return safeWidgetMapping;
    };

    _addWidgetToContent: (
        oldContent: string,
        cursorRange: ReadonlyArray<number>,
        widgetType: string,
    ) => void = (
        oldContent: string,
        cursorRange: ReadonlyArray<number>,
        widgetType: string,
    ) => {
        // eslint-disable-next-line react/no-string-refs
        const textarea = ReactDOM.findDOMNode(this.refs.textarea);

        // Note: we have to use _.map here instead of Array::map
        // because the results of a .match might be null if no
        // widgets were found.
        // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'RegExpMatchArray | null' is not assignable to parameter of type 'Collection<any>'.
        const allWidgetIds = _.map(oldContent.match(rWidgetSplit), (syntax) => {
            const match = Util.rWidgetParts.exec(syntax);
            // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
            const type = match[2];
            // @ts-expect-error [FEI-5003] - TS2531 - Object is possibly 'null'.
            const num = +match[3];
            return [type, num];
        });

        const widgetNum = _.reduce(
            allWidgetIds,
            (currentNum, otherId) => {
                const [otherType, otherNum] = otherId;
                if (otherType === widgetType) {
                    return Math.max(otherNum + 1, currentNum);
                }
                return currentNum;
            },
            1,
        );

        const id = widgetType + " " + widgetNum;
        const widgetContent = widgetPlaceholder.replace("{id}", id);

        // Add newlines before block-display widgets like graphs
        const isBlock = Widgets.getDefaultAlignment(widgetType) === "block";

        const prelude = oldContent.slice(0, cursorRange[0]);
        const postlude = oldContent.slice(cursorRange[1]);

        const newPrelude = isBlock
            ? makeEndWithAParagraphIfNecessary(prelude)
            : prelude;
        const newPostlude = isBlock
            ? makeStartWithAParagraphAlways(postlude)
            : postlude;

        const newContent = newPrelude + widgetContent + newPostlude;

        const newWidgets = _.clone(this.props.widgets);
        newWidgets[id] = {
            options: Widgets.getEditor(widgetType)?.defaultProps,
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'string' is not assignable to type '"video" | "image" | "iframe" | "table" | "radio" | "definition" | "group" | "matrix" | "categorizer" | "cs-program" | "dropdown" | "example-graphie-widget" | "example-widget" | ... 26 more ... | "unit-input"'.
            type: widgetType,
            // Track widget version on creation, so that a widget editor
            // without a valid version prop can only possibly refer to a
            // pre-versioning creation time.
            // @ts-expect-error [FEI-5003] - TS2322 - Type 'Version | null | undefined' is not assignable to type 'Version | undefined'.
            version: Widgets.getVersion(widgetType),
        };

        // See componentDidUpdate() for how this flag is used
        this.lastUserValue = this.props.content;
        this.props.onChange(
            {
                content: newContent,
                widgets: newWidgets,
            },
            function () {
                Util.textarea.moveCursor(
                    // findDOMNode can return Text but we know this is Element
                    // $FlowFixMe[incompatible-call]
                    // @ts-expect-error [FEI-5003] - TS2345 - Argument of type 'Element | Text | null' is not assignable to parameter of type 'HTMLTextAreaElement'.
                    textarea,
                    // We want to put the cursor after the widget
                    // and after any added newlines
                    newContent.length - postlude.length,
                );
            },
        );
    };

    _addWidget: (widgetType: string) => void = (widgetType: string) => {
        // eslint-disable-next-line react/no-string-refs
        const textarea = this.refs.textarea;

        this._addWidgetToContent(
            this.props.content,
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'selectionStart' does not exist on type 'ReactInstance'. | TS2339 - Property 'selectionEnd' does not exist on type 'ReactInstance'.
            [textarea.selectionStart, textarea.selectionEnd],
            widgetType,
        );
        // @ts-expect-error [FEI-5003] - TS2339 - Property 'focus' does not exist on type 'ReactInstance'.
        textarea.focus();
    };

    addTemplate: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void = (
        e: React.SyntheticEvent<HTMLTextAreaElement>,
    ) => {
        const templateType = e.currentTarget.value;
        if (templateType === "") {
            return;
        }
        e.currentTarget.value = "";

        let oldContent = this.props.content;

        // Force templates to have a blank line before them,
        // as they are usually used as block elements
        // (especially important for tables)
        oldContent = oldContent.replace(/\n*$/, "\n\n");

        let template;
        if (templateType === "table") {
            template =
                "header 1 | header 2 | header 3\n" +
                "- | - | -\n" +
                "data 1 | data 2 | data 3\n" +
                "data 4 | data 5 | data 6\n" +
                "data 7 | data 8 | data 9";
        } else if (templateType === "titledTable") {
            template =
                "|| **Table title** ||\n" +
                "header 1 | header 2 | header 3\n" +
                "- | - | -\n" +
                "data 1 | data 2 | data 3\n" +
                "data 4 | data 5 | data 6\n" +
                "data 7 | data 8 | data 9";
        } else if (templateType === "alignment") {
            template =
                "$\\begin{align} x+5 &= 30 \\\\\n" +
                "x+5-5 &= 30-5 \\\\\n" +
                "x &= 25 \\end{align}$";
        } else if (templateType === "piecewise") {
            template =
                "$f(x) = \\begin{cases}\n" +
                "7 & \\text{if }x=1 \\\\\n" +
                "f(x-1)+5 & \\text{if }x > 1\n" +
                "\\end{cases}$";
        } else if (templateType === "allWidgets") {
            template = Widgets.getAllWidgetTypes()
                .map((type) => `[[${Util.snowman} ${type} 1]]`)
                .join("\n\n");
        } else {
            throw new PerseusError(
                "Invalid template type: " + templateType,
                Errors.InvalidInput,
                {
                    metadata: {templateType},
                },
            );
        }

        const newContent = oldContent + template;

        // See componentDidUpdate() for how this flag is used
        this.lastUserValue = this.props.content;
        this.props.onChange({content: newContent}, this.focusAndMoveToEnd);
    };

    getSaveWarnings: () => any = () => {
        // eslint-disable-next-line react/no-string-refs
        const widgetIds = _.intersection(this.widgetIds, _.keys(this.refs));
        const warnings = _(widgetIds)
            .chain()
            .map((id) => {
                // eslint-disable-next-line react/no-string-refs
                // @ts-expect-error [FEI-5003] - TS2339 - Property 'getSaveWarnings' does not exist on type 'ReactInstance'.
                const issuesFunc = this.refs[id].getSaveWarnings;
                const issues = issuesFunc ? issuesFunc() : [];
                return _.map(issues, (issue) => id + ": " + issue);
            })
            .flatten(true)
            .value();

        return warnings;
    };

    focus: () => void = () => {
        // eslint-disable-next-line react/no-string-refs
        const textarea = ReactDOM.findDOMNode(this.refs.textarea);
        if (textarea) {
            /**
             * TODO(somewhatabstract, JIRA-XXXX):
             * textarea should be refined with an instanceof check to
             * HTMLTextAreaElement so that these props are available.
             */
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'focus' does not exist on type 'Element | Text'.
            textarea.focus();
        }
    };

    focusAndMoveToEnd: () => void = () => {
        this.focus();
        // eslint-disable-next-line react/no-string-refs
        const textarea = ReactDOM.findDOMNode(this.refs.textarea);
        if (textarea) {
            /**
             * TODO(somewhatabstract, JIRA-XXXX):
             * textarea should be refined with an instanceof check to
             * HTMLTextAreaElement so that these props are available.
             */
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'selectionStart' does not exist on type 'Element | Text'. | TS2339 - Property 'value' does not exist on type 'Element | Text'.
            textarea.selectionStart = textarea.value.length;
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'selectionEnd' does not exist on type 'Element | Text'. | TS2339 - Property 'value' does not exist on type 'Element | Text'.
            textarea.selectionEnd = textarea.value.length;
        }
    };

    serialize: (options?: any) => {
        content: string;
        images: any;
        replace: any | undefined;
        widgets: Record<any, any>;
    } = (options: any) => {
        // need to serialize the widgets since the state might not be
        // completely represented in props. ahem //transformer// (and
        // interactive-graph and plotter).
        const widgets: Record<string, any> = {};
        // eslint-disable-next-line react/no-string-refs
        const widgetIds = _.intersection(this.widgetIds, _.keys(this.refs));
        _.each(widgetIds, (id) => {
            // eslint-disable-next-line react/no-string-refs
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'serialize' does not exist on type 'ReactInstance'.
            widgets[id] = this.refs[id].serialize();
        });

        // Preserve the data associated with deleted widgets in their last
        // modified form. This is only intended to be useful in the context of
        // immediate cut and paste operations if Editor.serialize() is called
        // in between the two (which ideally should not be happening).
        // TODO(alex): Remove this once all widget.serialize() methods
        //             have been fixed to only return props,
        //             and the above no longer applies.
        if (options && options.keepDeletedWidgets) {
            _.chain(this.props.widgets)
                .keys()
                .reject((id) => _.contains(widgetIds, id))
                .each((id) => {
                    widgets[id] = this.props.widgets[id];
                });
        }

        return {
            replace: this.props.replace,
            content: this.props.content,
            images: this.props.images,
            widgets: widgets,
        };
    };

    render(): React.ReactElement<React.ComponentProps<"div">> {
        let pieces;
        let widgets;
        let underlayPieces;
        let widgetsDropDown;
        let templatesDropDown;
        let widgetsAndTemplates;
        let wordCountDisplay;
        const katexErrorList: Array<{
            math: string;
            message: never;
        }> = [];

        if (this.props.showWordCount) {
            const numChars = PerseusMarkdown.characterCount(this.props.content);
            const numWords = Math.floor(numChars / 6);
            wordCountDisplay = (
                <span
                    className="perseus-editor-word-count"
                    title={
                        "~" +
                        commafyInteger(numWords) +
                        " words (" +
                        commafyInteger(numChars) +
                        " characters)"
                    }
                >
                    {commafyInteger(numWords)}
                </span>
            );
        }

        const {katex} = this.state;

        if (this.props.widgetEnabled && katex) {
            pieces = Util.split(this.props.content, rWidgetSplit);
            widgets = {};
            underlayPieces = [];

            for (let i = 0; i < pieces.length; i++) {
                if (i % 2 === 0) {
                    // Normal text
                    underlayPieces.push(pieces[i]);

                    // @ts-expect-error [FEI-5003] - TS2554 - Expected 2 arguments, but got 1.
                    const ast = PerseusMarkdown.parse(pieces[i]);

                    PerseusMarkdown.traverseContent(ast, (node) => {
                        if (node.type === "math" || node.type === "blockMath") {
                            const content = preprocessTex(node.content);
                            try {
                                katex.renderToString(content, {
                                    colorIsTextColor: true,
                                });
                            } catch (e: any) {
                                katexErrorList.push({
                                    math: content,
                                    // @ts-expect-error [FEI-5003] - TS2322 - Type 'any' is not assignable to type 'never'.
                                    message: e.message,
                                });
                            }
                        }
                    });
                } else {
                    // Widget reference
                    const match = Util.rWidgetParts.exec(pieces[i]);
                    if (match != null) {
                        const id = match[1];
                        const type = match[2];

                        const selected = false;
                        // TODO(alpert):
                        // var selected = focused && selStart === selEnd &&
                        //         offset <= selStart &&
                        //         selStart < offset + text.length;
                        // if (selected) {
                        //     selectedWidget = id;
                        // }

                        const duplicate = id in widgets;

                        widgets[id] = this.getWidgetEditor(id, type);
                        const classes =
                            (duplicate || !widgets[id] ? "error " : "") +
                            (selected ? "selected " : "");
                        const key = duplicate ? i : id;
                        underlayPieces.push(
                            <b className={classes} key={key}>
                                {pieces[i]}
                            </b>,
                        );
                    }
                }
            }

            // TODO(alpert): Move this to the content-change event handler
            // _.each(_.keys(this.props.widgets), function(id) {
            //     if (!(id in widgets)) {
            //         // It's strange if these preloaded options stick around
            //         // since it's inconsistent with how things work if you
            //         // don't have the serialize/deserialize step in the
            //         // middle
            //         // TODO(alpert): Save options in a consistent manner so
            //         // that you can undo the deletion of a widget
            //         delete this.props.widgets[id];
            //     }
            // }, this);

            this.widgetIds = _.keys(widgets);
            widgetsDropDown = (
                // eslint-disable-next-line react/no-string-refs
                <WidgetSelect ref="widgetSelect" onChange={this._addWidget} />
            );

            const insertTemplateString = "Insert template\u2026";
            templatesDropDown = (
                // @ts-expect-error [FEI-5003] - TS2322 - Type '(e: SyntheticEvent<HTMLTextAreaElement, Event>) => void' is not assignable to type 'ChangeEventHandler<HTMLSelectElement>'.
                <select onChange={this.addTemplate}>
                    <option value="">{insertTemplateString}</option>
                    <option disabled>--</option>
                    <option value="table">Table</option>
                    <option value="titledTable">Titled table</option>
                    <option value="alignment">Aligned equations</option>
                    <option value="piecewise">Piecewise function</option>
                    <option disabled>--</option>
                    <option value="allWidgets">
                        All widgets (for testing)
                    </option>
                </select>
            );

            if (!this.props.immutableWidgets) {
                const widgetNodes = Object.values(widgets) as React.ReactNode;
                widgetsAndTemplates = (
                    <div className="perseus-editor-widgets">
                        <div className="perseus-editor-widgets-selectors">
                            {widgetsDropDown}
                            {templatesDropDown}
                            {wordCountDisplay}
                        </div>
                        {widgetNodes}
                    </div>
                );
                // Prevent word count from being displayed elsewhere
                wordCountDisplay = null;
            }
        } else {
            underlayPieces = [this.props.content];
        }

        // Without this, the underlay isn't the proper size when the text ends
        // with a newline.
        underlayPieces.push(<br key="end" />);

        const completeTextarea = [
            <div
                className="perseus-textarea-underlay"
                // eslint-disable-next-line react/no-string-refs
                ref="underlay"
                key="underlay"
            >
                {underlayPieces}
            </div>,
            <textarea
                // eslint-disable-next-line react/no-string-refs
                ref="textarea"
                key="textarea"
                onChange={this.handleChange}
                onKeyDown={this._handleKeyDown}
                placeholder={this.props.placeholder}
                disabled={this.props.disabled}
                value={this.state.textAreaValue}
            />,
        ];

        let textareaWrapper;
        if (this.props.imageUploader) {
            textareaWrapper = (
                <DragTarget
                    onDrop={this.handleDrop}
                    className="perseus-textarea-pair"
                >
                    {completeTextarea}
                </DragTarget>
            );
        } else {
            textareaWrapper = (
                <div className="perseus-textarea-pair">{completeTextarea}</div>
            );
        }

        const contentWithoutWidgets = this.props.content.replace(
            /\[\[\u2603 (([a-z-]+) ([0-9]+))\]\]/g,
            "",
        );
        const noPrompt = contentWithoutWidgets.trim().length === 0;
        const noWidgets = !/\[\[\u2603 (([a-z-]+) ([0-9]+))\]\]/g.test(
            this.props.content,
        );

        const warningStyle = {
            borderTop: "none",
            padding: 4,
            backgroundColor: "pink",
        } as const;

        return (
            <div
                className={
                    "perseus-single-editor " + (this.props.className || "")
                }
            >
                {textareaWrapper}
                {katexErrorList.length > 0 && (
                    <KatexErrorView errorList={katexErrorList} />
                )}
                {this.props.warnNoPrompt && noPrompt && (
                    <div style={warningStyle}>
                        Graded Groups should contain a prompt
                    </div>
                )}
                {this.props.warnNoWidgets && noWidgets && (
                    <div style={warningStyle}>
                        Graded Groups should contain at least one widget
                    </div>
                )}
                {wordCountDisplay}
                {widgetsAndTemplates}
            </div>
        );
    }
}

export default Editor;