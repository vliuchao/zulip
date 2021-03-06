zrequire('rows');
zrequire('lightbox');

set_global('blueslip', global.make_zblueslip());

set_global('message_store', {});
set_global('Image', class Image {});
set_global('overlays', {
    close_overlay: () => {},
    close_active: () => {},
    open_overlay: () => {},
});
set_global('popovers', {
    hide_all: () => {},
});

set_global('$', global.make_zjquery());

run_test('pan_and_zoom', () => {
    $.clear_all_elements();

    const img = $.create('img-stub');
    const link = $.create('link-stub');
    const msg = $.create('msg-stub');

    $(img).closest = () => [];

    img.set_parent(link);
    link.closest = () => msg;
    msg.attr("zid", "1234");

    let fetched_zid;

    message_store.get = (zid) => {
        fetched_zid = zid;
        return 'message-stub';
    };

    // Used by render_lightbox_list_images
    $.stub_selector('.focused_table .message_inline_image img', []);

    lightbox.open(img);
    assert.equal(blueslip.get_test_logs('error').length, 0);

    assert.equal(fetched_zid, 1234);
});

run_test('youtube', () => {
    $.clear_all_elements();

    const href = 'https://youtube.com/some-random-clip';
    const img = $.create('img-stub');
    const link = $.create('link-stub');
    const msg = $.create('msg-stub');

    msg.attr("zid", "4321");

    $(img).attr('src', href);

    $(img).closest = (sel) => {
        if (sel === '.youtube-video') {
            // We just need a nonempty array to
            // set is_youtube_video to true.
            return ['whatever'];
        }
        return [];
    };

    img.set_parent(link);
    link.closest = () => msg;
    link.attr('href', href);

    // Used by render_lightbox_list_images
    $.stub_selector('.focused_table .message_inline_image img', []);

    lightbox.open(img);
    assert.equal($('.image-actions .open').attr('href'), href);
    assert.equal(blueslip.get_test_logs('error').length, 0);
});
