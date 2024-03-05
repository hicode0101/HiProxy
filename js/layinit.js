
lay.options = function (elem, opts) {
    opts = typeof opts === 'object' ? opts : { attr: opts };

    if (elem === document) return {};

    var othis = lay(elem);
    var attrName = opts.attr || 'lay-options';
    var attrValue = othis.attr(attrName);

    try {
        /**
         * 请注意: 开发者在使用 lay-options="{}" 配置组件选项时，需确保属性值不来自于网页用户,
         * 即属性值必须在网页开发者自身的可控范围内，否则请勿在 HTML 标签属性中获取组件选项。
         */
        //return new Function('return '+ (attrValue || '{}'))();

        return {};

    } catch (ev) {
        layui.hint().error(opts.errorText || [
            attrName + '="' + attrValue + '"',
            '\n parseerror: ' + ev
        ].join('\n'), 'error');
        return {};
    }
};

