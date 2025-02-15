import {
    linterContextProps,
    linterContextDefault,
} from "@khanacademy/perseus-linter";
import PropTypes from "prop-types";
import * as React from "react";
import _ from "underscore";

import InlineIcon from "../components/inline-icon";
import {iconOk} from "../icon-paths";
import * as Changeable from "../mixins/changeable";
import {ApiOptions} from "../perseus-api";
import Renderer from "../renderer";
import Util from "../util";

import type {WidgetExports} from "../types";

class Sequence extends React.Component<any, any> {
    static propTypes = {
        ...Changeable.propTypes,
        apiOptions: ApiOptions.propTypes,
        json: PropTypes.arrayOf(
            PropTypes.shape({
                content: PropTypes.string,
                images: PropTypes.objectOf(PropTypes.any),
                widgets: PropTypes.objectOf(PropTypes.any),
            }),
        ),
        trackInteraction: PropTypes.func.isRequired,
        linterContext: linterContextProps,
    };

    static defaultProps: any = {
        json: [
            {
                content: "",
                widgets: {},
                images: {},
            },
        ],
        linterContext: linterContextDefault,
    };

    state: any = {
        visible: 1,
    };

    shouldComponentUpdate(nextProps: any, nextState: any): boolean {
        return nextProps !== this.props || nextState !== this.state;
    }

    change: (arg1: any, arg2: any, arg3: any) => any = (...args) => {
        return Changeable.change.apply(this, args);
    };

    _handleInteraction: (arg1: string) => void = (groupWidgetId) => {
        const step = parseInt(groupWidgetId.split(" ")[1]);
        if (step === this.state.visible - 1) {
            // eslint-disable-next-line react/no-string-refs
            // @ts-expect-error [FEI-5003] - TS2339 - Property 'getWidgetInstance' does not exist on type 'ReactInstance'.
            const widget = this.refs.renderer.getWidgetInstance(
                "group " + step,
            );

            widget.showRationalesForCurrentlySelectedChoices();
            const score = widget.simpleValidate();

            if (score.type === "points" && score.total === score.earned) {
                this.setState({
                    visible: this.state.visible + 1,
                });
                this.props.trackInteraction({
                    visible: this.state.visible + 1,
                });
            }
        }
    };

    render(): React.ReactNode {
        const icon = <InlineIcon {...iconOk} style={{color: "green"}} />;

        const content = _.chain(this.props.json)
            .first(this.state.visible)
            .map((step, i) => `[[${Util.snowman} group ${i}]]`)
            .join("\n\n")
            .value();

        const widgets: Record<string, any> = {};
        _.each(this.props.json, (step, i) => {
            const widgetId = `group ${i}`;
            widgets[widgetId] = {
                type: "group",
                graded: true,
                version: {major: 0, minor: 0},
                options: _.extend({}, step, {
                    icon: i < this.state.visible - 1 ? icon : null,
                }),
            };
        });

        return (
            <div className="perseus-sequence">
                <Renderer
                    // eslint-disable-next-line react/no-string-refs
                    ref="renderer"
                    content={content}
                    widgets={widgets}
                    onInteractWithWidget={this._handleInteraction}
                    apiOptions={this.props.apiOptions}
                    linterContext={this.props.linterContext}
                />
            </div>
        );
    }
}

const traverseChildWidgets = function (props: any, traverseRenderer: any): any {
    let oldJson = props.json;
    if (!_.isArray(oldJson)) {
        oldJson = [oldJson];
    }
    const json = _.map(oldJson, (rendererOptions) => {
        return traverseRenderer(rendererOptions);
    });

    return _.extend({}, props, {json: json});
};

export default {
    name: "sequence",
    displayName: "Graded Sequence",
    widget: Sequence,
    traverseChildWidgets: traverseChildWidgets,
    tracking: "all",
    hidden: true,
    isLintable: true,
} as WidgetExports<typeof Sequence>;
