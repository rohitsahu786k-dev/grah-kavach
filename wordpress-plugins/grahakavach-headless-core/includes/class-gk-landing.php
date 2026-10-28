<?php
/**
 * "Book Now" landing page content.
 *
 * The campaign landing page at /book-now is a WordPress page (slug `book-now`)
 * so that everything on it is edited in wp-admin: the copy, the images from the
 * media library, and the SEO title, description and social card through Yoast.
 * The field list below is the single source for the editor UI and for GraphQL.
 *
 * Prices are not stored here. The storefront reads the live price from the
 * WooCommerce product and the advance from the Deposits settings, and drops them
 * into the copy through these tokens, so the page can never show a figure the
 * checkout does not charge:
 *
 *   {price}     offer price          {mrp}      regular price
 *   {discount}  mrp minus price      {advance}  amount paid now
 *   {balance}   price minus advance  {end}      offer end time, 12-hour
 *
 * Wrap words in **double asterisks** to make them bold.
 *
 * Starter content and images are written once, only into empty fields, from
 * the design supplied for the campaign. After that, wp-admin owns them.
 *
 * @package GrahaKavach\HeadlessCore
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manifest and starter content for the landing page.
 */
final class GK_Landing {

	public const SLUG = 'book-now';
	private const FLAG = 'gk_landing_seeded_v1';

	public static function init(): void {
		add_action( 'admin_init', array( __CLASS__, 'maybe_seed' ), 30 );
	}

	/**
	 * The landing page ID, creating the page on first use.
	 */
	public static function page_id(): int {
		return GK_CPT::page_id_by_slug( self::SLUG, 'Book Now' );
	}

	/**
	 * Field manifest.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function fields(): array {
		$tokens = 'Tokens: {price} {mrp} {discount} {advance} {balance} {end}. Wrap words in **double asterisks** for bold.';

		return array(
			// ---- Offer & timer -------------------------------------------
			array( 'name' => 'lp_topbar_text', 'label' => 'Top bar text', 'type' => 'text', 'gql' => 'topbarText', 'tab' => 'Offer & timer', 'hint' => $tokens ),
			array( 'name' => 'lp_end_time', 'label' => 'Offer ends daily at', 'type' => 'text', 'gql' => 'endTime', 'tab' => 'Offer & timer', 'hint' => '24-hour time, India time, e.g. 23:59. The countdown restarts every day unless a fixed end below is set.' ),
			array( 'name' => 'lp_ends_at', 'label' => 'Fixed offer end (optional)', 'type' => 'text', 'gql' => 'endsAt', 'tab' => 'Offer & timer', 'hint' => 'India time, format YYYY-MM-DD HH:MM, e.g. 2026-11-10 23:59. When set, the countdown runs to this moment and stops at zero.' ),
			array( 'name' => 'lp_timer_label', 'label' => 'Countdown label', 'type' => 'text', 'gql' => 'timerLabel', 'tab' => 'Offer & timer' ),
			array( 'name' => 'lp_timer_units', 'label' => 'Countdown units', 'type' => 'text', 'gql' => 'timerUnits', 'tab' => 'Offer & timer', 'hint' => 'Three words separated by commas: hours, minutes, seconds.' ),
			array( 'name' => 'lp_sticky_label', 'label' => 'Sticky bar label', 'type' => 'text', 'gql' => 'stickyLabel', 'tab' => 'Offer & timer', 'hint' => $tokens ),
			array( 'name' => 'lp_lock_label', 'label' => 'Booking steps: time-left label', 'type' => 'text', 'gql' => 'lockLabel', 'tab' => 'Offer & timer' ),

			// ---- Header & buttons ----------------------------------------
			array( 'name' => 'lp_header_tagline', 'label' => 'Header tagline', 'type' => 'text', 'gql' => 'headerTagline', 'tab' => 'Header & buttons' ),
			array( 'name' => 'lp_cta_short', 'label' => 'Header button', 'type' => 'text', 'gql' => 'ctaShort', 'tab' => 'Header & buttons' ),
			array( 'name' => 'lp_cta_label', 'label' => 'Main button', 'type' => 'text', 'gql' => 'ctaLabel', 'tab' => 'Header & buttons', 'hint' => $tokens ),
			array( 'name' => 'lp_cta_sticky', 'label' => 'Sticky bar button', 'type' => 'text', 'gql' => 'ctaSticky', 'tab' => 'Header & buttons', 'hint' => $tokens ),
			array( 'name' => 'lp_cta_offer', 'label' => 'Offer box button', 'type' => 'text', 'gql' => 'ctaOffer', 'tab' => 'Header & buttons' ),

			// ---- Hero ------------------------------------------------------
			array( 'name' => 'lp_hero_badge', 'label' => 'Badge', 'type' => 'text', 'gql' => 'heroBadge', 'tab' => 'Hero' ),
			array( 'name' => 'lp_hero_title_1', 'label' => 'Headline, first line', 'type' => 'text', 'gql' => 'heroTitleBefore', 'tab' => 'Hero' ),
			array( 'name' => 'lp_hero_title_hl', 'label' => 'Headline, red words', 'type' => 'text', 'gql' => 'heroTitleHighlight', 'tab' => 'Hero' ),
			array( 'name' => 'lp_hero_title_2', 'label' => 'Headline, rest', 'type' => 'text', 'gql' => 'heroTitleAfter', 'tab' => 'Hero' ),
			array( 'name' => 'lp_hero_text', 'label' => 'Intro', 'type' => 'textarea', 'gql' => 'heroText', 'tab' => 'Hero', 'hint' => $tokens ),
			array( 'name' => 'lp_hero_image', 'label' => 'Kit image', 'type' => 'image', 'gql' => 'heroImage', 'tab' => 'Hero', 'hint' => 'Square, 900x900 or larger. Set the alt text in the media library.' ),
			array( 'name' => 'lp_hero_image_tag', 'label' => 'Image tag', 'type' => 'text', 'gql' => 'heroImageTag', 'tab' => 'Hero' ),
			array( 'name' => 'lp_now_label', 'label' => 'Pay-now card: label', 'type' => 'text', 'gql' => 'nowLabel', 'tab' => 'Hero' ),
			array( 'name' => 'lp_now_note', 'label' => 'Pay-now card: note', 'type' => 'text', 'gql' => 'nowNote', 'tab' => 'Hero' ),
			array( 'name' => 'lp_later_label', 'label' => 'Pay-on-delivery card: label', 'type' => 'text', 'gql' => 'laterLabel', 'tab' => 'Hero' ),
			array( 'name' => 'lp_later_note', 'label' => 'Pay-on-delivery card: note', 'type' => 'text', 'gql' => 'laterNote', 'tab' => 'Hero' ),
			array( 'name' => 'lp_hero_trust', 'label' => 'Trust line', 'type' => 'structured', 'gql' => 'heroTrust', 'gqltype' => 'GrahaKavachTextRow', 'shape' => array( 'text' ), 'tab' => 'Hero' ),
			array( 'name' => 'lp_ticker', 'label' => 'Red ticker', 'type' => 'structured', 'gql' => 'ticker', 'gqltype' => 'GrahaKavachTextRow', 'shape' => array( 'text' ), 'tab' => 'Hero', 'hint' => $tokens ),

			// ---- Why -------------------------------------------------------
			array( 'name' => 'lp_why_eyebrow', 'label' => 'Eyebrow', 'type' => 'text', 'gql' => 'whyEyebrow', 'tab' => 'Why it matters' ),
			array( 'name' => 'lp_why_title', 'label' => 'Heading', 'type' => 'text', 'gql' => 'whyTitle', 'tab' => 'Why it matters' ),
			array( 'name' => 'lp_stat_big', 'label' => 'Big statistic', 'type' => 'text', 'gql' => 'statBig', 'tab' => 'Why it matters' ),
			array( 'name' => 'lp_stat_text', 'label' => 'Statistic text', 'type' => 'textarea', 'gql' => 'statText', 'tab' => 'Why it matters' ),
			array( 'name' => 'lp_stat_source', 'label' => 'Statistic source', 'type' => 'text', 'gql' => 'statSource', 'tab' => 'Why it matters' ),
			array( 'name' => 'lp_why_points', 'label' => 'Numbered points', 'type' => 'structured', 'gql' => 'whyPoints', 'gqltype' => 'GrahaKavachTitleTextRow', 'shape' => array( 'title', 'text' ), 'tab' => 'Why it matters' ),

			// ---- Kit -------------------------------------------------------
			array( 'name' => 'lp_kit_eyebrow', 'label' => 'Eyebrow', 'type' => 'text', 'gql' => 'kitEyebrow', 'tab' => 'What is in the kit' ),
			array( 'name' => 'lp_kit_title', 'label' => 'Heading', 'type' => 'text', 'gql' => 'kitTitle', 'tab' => 'What is in the kit' ),
			array( 'name' => 'lp_kit_items', 'label' => 'Kit items', 'type' => 'structured', 'gql' => 'kitItems', 'gqltype' => 'GrahaKavachTitleTextFocusRow', 'shape' => array( 'title', 'text', 'focus' ), 'tab' => 'What is in the kit', 'hint' => 'FOCUS is the crop position of the thumbnail, e.g. 30% 50%. Images below are matched to items in order.' ),
			array( 'name' => 'lp_kit_images', 'label' => 'Kit item images', 'type' => 'gallery_rel', 'gql' => 'kitImages', 'tab' => 'What is in the kit', 'hint' => 'One image per kit item, in the same order. Wide images (16:9) crop best.' ),
			array( 'name' => 'lp_kit_extra', 'label' => 'Also included', 'type' => 'textarea', 'gql' => 'kitExtra', 'tab' => 'What is in the kit' ),
			array( 'name' => 'lp_kit_badges', 'label' => 'Certification chips', 'type' => 'structured', 'gql' => 'kitBadges', 'gqltype' => 'GrahaKavachTextRow', 'shape' => array( 'text' ), 'tab' => 'What is in the kit' ),

			// ---- Offer box -------------------------------------------------
			array( 'name' => 'lp_offer_title', 'label' => 'Offer box heading', 'type' => 'text', 'gql' => 'offerTitle', 'tab' => 'Offer box', 'hint' => $tokens ),
			array( 'name' => 'lp_offer_points', 'label' => 'Offer points', 'type' => 'structured', 'gql' => 'offerPoints', 'gqltype' => 'GrahaKavachTextRow', 'shape' => array( 'text' ), 'tab' => 'Offer box', 'hint' => $tokens ),
			array( 'name' => 'lp_offer_note', 'label' => 'Offer note', 'type' => 'text', 'gql' => 'offerNote', 'tab' => 'Offer box', 'hint' => $tokens ),

			// ---- Steps -----------------------------------------------------
			array( 'name' => 'lp_steps_title', 'label' => 'Heading', 'type' => 'text', 'gql' => 'stepsTitle', 'tab' => 'How booking works' ),
			array( 'name' => 'lp_steps', 'label' => 'Steps', 'type' => 'structured', 'gql' => 'steps', 'gqltype' => 'GrahaKavachTitleTextRow', 'shape' => array( 'title', 'text' ), 'tab' => 'How booking works', 'hint' => $tokens ),

			// ---- Where it goes ---------------------------------------------
			array( 'name' => 'lp_where_title', 'label' => 'Heading', 'type' => 'text', 'gql' => 'whereTitle', 'tab' => 'Where it goes' ),
			array( 'name' => 'lp_where_image', 'label' => 'Main image', 'type' => 'image', 'gql' => 'whereImage', 'tab' => 'Where it goes', 'hint' => 'Square, 900x900 or larger.' ),
			array( 'name' => 'lp_where_caption', 'label' => 'Main image caption', 'type' => 'text', 'gql' => 'whereCaption', 'tab' => 'Where it goes' ),
			array( 'name' => 'lp_where_tiles', 'label' => 'Small tiles', 'type' => 'structured', 'gql' => 'whereTiles', 'gqltype' => 'GrahaKavachLabelFocusRow', 'shape' => array( 'label', 'focus' ), 'tab' => 'Where it goes', 'hint' => 'FOCUS is the crop position, e.g. 70% 50%. Images below are matched to tiles in order.' ),
			array( 'name' => 'lp_where_tile_images', 'label' => 'Tile images', 'type' => 'gallery_rel', 'gql' => 'whereTileImages', 'tab' => 'Where it goes' ),

			// ---- Reviews & trust -------------------------------------------
			array( 'name' => 'lp_reviews', 'label' => 'Customer reviews', 'type' => 'structured', 'gql' => 'reviews', 'gqltype' => 'GrahaKavachQuoteRow', 'shape' => array( 'quote', 'name' ), 'tab' => 'Reviews & trust', 'hint' => 'Real customer words only. The section is hidden while this is empty.' ),
			array( 'name' => 'lp_trust_bold', 'label' => 'Trust note, bold part', 'type' => 'text', 'gql' => 'trustBold', 'tab' => 'Reviews & trust' ),
			array( 'name' => 'lp_trust_text', 'label' => 'Trust note', 'type' => 'textarea', 'gql' => 'trustText', 'tab' => 'Reviews & trust' ),

			// ---- FAQ -------------------------------------------------------
			array( 'name' => 'lp_faq_title', 'label' => 'Heading', 'type' => 'text', 'gql' => 'faqTitle', 'tab' => 'FAQ' ),
			array( 'name' => 'lp_faqs', 'label' => 'Questions', 'type' => 'structured', 'gql' => 'faqs', 'gqltype' => 'GrahaKavachQaRow', 'shape' => array( 'q', 'a' ), 'tab' => 'FAQ', 'hint' => 'These are also published to Google as FAQ structured data. ' . $tokens ),

			// ---- Closing ---------------------------------------------------
			array( 'name' => 'lp_final_kicker', 'label' => 'Closing: label above timer', 'type' => 'text', 'gql' => 'finalKicker', 'tab' => 'Closing' ),
			array( 'name' => 'lp_final_title', 'label' => 'Closing heading', 'type' => 'text', 'gql' => 'finalTitle', 'tab' => 'Closing' ),
			array( 'name' => 'lp_final_text', 'label' => 'Closing text', 'type' => 'text', 'gql' => 'finalText', 'tab' => 'Closing' ),
			array( 'name' => 'lp_contact_label', 'label' => 'Contact line', 'type' => 'text', 'gql' => 'contactLabel', 'tab' => 'Closing' ),
			array( 'name' => 'lp_phone', 'label' => 'Phone / WhatsApp number', 'type' => 'text', 'gql' => 'phone', 'tab' => 'Closing', 'hint' => 'Ten digits, no country code.' ),
			array( 'name' => 'lp_footer_text', 'label' => 'Footer text', 'type' => 'textarea', 'gql' => 'footerText', 'tab' => 'Closing' ),

			// ---- Booking steps ---------------------------------------------
			array( 'name' => 'lp_d_title', 'label' => 'Step 1 heading', 'type' => 'text', 'gql' => 'detailsTitle', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_d_sub', 'label' => 'Step 1 sub-heading', 'type' => 'text', 'gql' => 'detailsSub', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_d_note', 'label' => 'Step 1 privacy note', 'type' => 'text', 'gql' => 'detailsNote', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_p_title', 'label' => 'Step 2 heading', 'type' => 'text', 'gql' => 'payTitle', 'tab' => 'Booking steps', 'hint' => $tokens ),
			array( 'name' => 'lp_p_secure', 'label' => 'Step 2 secure-payment note', 'type' => 'text', 'gql' => 'paySecure', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_done_title', 'label' => 'Confirmed heading', 'type' => 'text', 'gql' => 'doneTitle', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_done_text', 'label' => 'Confirmed text', 'type' => 'textarea', 'gql' => 'doneText', 'tab' => 'Booking steps', 'hint' => $tokens ),
			array( 'name' => 'lp_done_steps', 'label' => 'What happens next', 'type' => 'structured', 'gql' => 'doneSteps', 'gqltype' => 'GrahaKavachTextRow', 'shape' => array( 'text' ), 'tab' => 'Booking steps', 'hint' => $tokens ),
			array( 'name' => 'lp_done_wa_label', 'label' => 'WhatsApp button', 'type' => 'text', 'gql' => 'doneWhatsappLabel', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_wa_keyword', 'label' => 'WhatsApp keyword', 'type' => 'text', 'gql' => 'whatsappKeyword', 'tab' => 'Booking steps' ),
			array( 'name' => 'lp_done_home_label', 'label' => 'Back-to-home link', 'type' => 'text', 'gql' => 'doneHomeLabel', 'tab' => 'Booking steps' ),
		);
	}

	/**
	 * Starter copy, from the supplied design. Only written into empty fields.
	 *
	 * Reviews are deliberately absent: the design carried placeholders, and a
	 * review must be a real customer's words. The cancellation / refund FAQ is
	 * absent for the same reason: the policy wording belongs to the business.
	 *
	 * @return array<string,string>
	 */
	private static function copy(): array {
		return array(
			'lp_topbar_text'     => '{discount} की छूट सिर्फ़ आज रात {end} तक',
			'lp_end_time'        => '23:59',
			'lp_timer_label'     => 'ऑफ़र ख़त्म होने में',
			'lp_timer_units'     => 'घंटे, मिनट, सेकंड',
			'lp_sticky_label'    => '{discount} की छूट ख़त्म होने में',
			'lp_lock_label'      => 'ऑफ़र लॉक करने के लिए बचा समय',

			'lp_header_tagline'  => 'By Speciality Geochem, Udaipur',
			'lp_cta_short'       => 'Book Now',
			'lp_cta_label'       => 'Book Now — सिर्फ़ {advance}',
			'lp_cta_sticky'      => 'Book Now · {advance}',
			'lp_cta_offer'       => 'ऑफ़र के साथ Book Now',

			'lp_hero_badge'      => 'दीपावली ऑफ़र · सिर्फ़ आज',
			'lp_hero_title_1'    => 'आग बताकर नहीं आती।',
			'lp_hero_title_hl'   => 'पहले 60 सेकंड',
			'lp_hero_title_2'    => 'आपके हाथ में हैं।',
			'lp_hero_text'       => 'फ़ायर ब्रिगेड के आने से पहले घर बचाने के लिए जो चाहिए, वह सब एक बॉक्स में। आज रात {end} तक बुक करने पर **{mrp} की किट {price} में**, और बुकिंग सिर्फ़ {advance} से।',
			'lp_hero_image_tag'  => '3-IN-1 KIT',
			'lp_now_label'       => 'अभी सिर्फ़',
			'lp_now_note'        => 'बुकिंग पक्की हो जाती है',
			'lp_later_label'     => 'डिलीवरी पर',
			'lp_later_note'      => 'किट हाथ में आने पर, नक़द या UPI',
			'lp_hero_trust'      => "✓ पूरे भारत में मुफ़्त डिलीवरी\n✓ कैश ऑन डिलीवरी\n✓ CE प्रमाणित",
			'lp_ticker'          => "{discount} की छूट आज रात तक\nबुकिंग सिर्फ़ {advance}\nबाक़ी {balance} डिलीवरी पर\nमुफ़्त डिलीवरी",

			'lp_why_eyebrow'     => 'यह शौक़ नहीं, ज़रूरत है',
			'lp_why_title'       => 'आग लगने पर फ़ायर ब्रिगेड का इंतज़ार नहीं होता। पहला मिनट आपका होता है।',
			'lp_stat_big'        => '10 में से 6',
			'lp_stat_text'       => '2024 में आग से हुई 5,888 मौतों में से 3,585 घरों और रिहायशी इमारतों में हुईं।',
			'lp_stat_source'     => 'स्रोत: NCRB, Accidental Deaths & Suicides in India 2024',
			'lp_why_points'      => "दीपावली के दीये, लड़ियाँ, पटाखे|साल का सबसे ज़्यादा आग वाला हफ़्ता। घर को उससे पहले तैयार कर लीजिए।\nरसोई की कढ़ाई, LPG, गीज़र, AC, इन्वर्टर|तेल और बिजली की आग पर पानी डालना और ख़तरनाक है। सही चीज़ हाथ में होनी चाहिए।\nघर में बच्चे और बड़े-बुज़ुर्ग|उनके बाहर निकलने का समय छोटी आग को वहीं रोकने से मिलता है।",

			'lp_kit_eyebrow'     => 'किट में क्या है',
			'lp_kit_title'       => 'एक बॉक्स। तीन सुरक्षा। घर की हर तरह की आग के लिए।',
			'lp_kit_items'       => "2 किलो ABC फ़ायर एक्सटिंग्विशर|लकड़ी, कपड़ा, तेल, LPG और बिजली की आग के लिए। 10–12 सेकंड डिस्चार्ज, 3–4 मीटर रेंज। दीवार ब्रैकेट साथ।|30% 50%\nऑटोमैटिक फ़ायर बॉल, 1.3 किलो|आग के संपर्क में आते ही अपने आप फटकर बुझाती है, आप घर पर न हों तब भी। 5 साल की शेल्फ़ लाइफ़।|25% 50%\nफ़ायर ब्लैंकेट, 1 × 1 मीटर|फ़ाइबरग्लास, 550 °C तक। कढ़ाई या कपड़ों की आग को 2 सेकंड में ढककर बुझाइए।|70% 50%",
			'lp_kit_extra'       => 'साथ में: एक्सटिंग्विशर वॉल ब्रैकेट, फ़ायर बॉल स्टैंड, 5 स्क्रू, 5 वॉल प्लग और छपी हुई सुरक्षा गाइड।',
			'lp_kit_badges'      => "CE Marking\nISO 9001:2015\nNational Test House\nMSME ZED\nउदयपुर में निर्मित",

			'lp_offer_title'     => 'आज रात {end} तक बुक करने पर',
			'lp_offer_points'    => "{discount} की छूट: {mrp} की किट {price} में\nसिर्फ़ {advance} में बुकिंग पक्की, बाक़ी {balance} डिलीवरी पर\nपूरे भारत में मुफ़्त डिलीवरी",
			'lp_offer_note'      => 'रात {end} के बाद किट {mrp} पर वापस चली जाएगी।',

			'lp_steps_title'     => 'बुकिंग में 1 मिनट लगता है',
			'lp_steps'           => "{advance} देकर आज बुक करें|नाम, मोबाइल नंबर और पता। UPI, कार्ड या नेट बैंकिंग से {advance}।\nकिट घर पर पहुँचती है|मुफ़्त डिलीवरी, कूरियर से। ट्रैकिंग WhatsApp पर मिलेगी।\n{balance} डिलीवरी पर दें|किट देखकर, नक़द या UPI QR से। कुल क़ीमत {price}।",

			'lp_where_title'    => 'घर में कहाँ लगेगी',
			'lp_where_caption'  => 'रसोई में ब्लैंकेट · गलियारे में एक्सटिंग्विशर · मीटर/इन्वर्टर के पास फ़ायर बॉल',
			'lp_where_tiles'    => "रसोई|70% 50%\nगलियारा|30% 50%\nमीटर / इन्वर्टर|25% 50%",

			'lp_trust_bold'     => '16 साल से फ़ायर सेफ़्टी बना रहे हैं।',
			'lp_trust_text'     => 'Speciality Geochem, उदयपुर। जो कंपनी फ़ैक्ट्रियों और दफ़्तरों को फ़ायर सेफ़्टी देती है, अब आपके घर के लिए।',

			'lp_faq_title'      => 'आपके सवाल',
			'lp_faqs'           => "ऑफ़र कब तक है?|आज रात {end} बजे तक। उसके बाद बुकिंग होगी, पर {discount} की छूट नहीं मिलेगी।\n{advance} के बाद बाक़ी भुगतान कब?|बाक़ी {balance} किट की डिलीवरी पर, नक़द या UPI से। कुल क़ीमत {price}।\nछोटे फ़्लैट या किराये के घर के लिए ठीक है?|हाँ। तीनों चीज़ें दीवार पर 5 स्क्रू से लगती हैं और शिफ़्ट होने पर साथ ले जा सकते हैं।\nक्या यह फ़ायर ब्रिगेड की जगह ले लेती है?|नहीं। यह पहले मिनट की छोटी आग के लिए है। बड़ी आग में पहले बाहर निकलिए और 101 पर कॉल कीजिए।\nडिलीवरी कितने दिन में होगी?|आमतौर पर 3–7 कार्यदिवस में।",

			'lp_final_kicker'   => '{discount} की छूट ख़त्म होने में',
			'lp_final_title'    => 'घर को भी सुरक्षा चाहिए।',
			'lp_final_text'     => 'कल सुबह आग का ख़तरा वही रहेगा। ऑफ़र नहीं रहेगा।',
			'lp_contact_label'  => 'सवाल है? WhatsApp या कॉल:',
			'lp_phone'          => '7891111390',
			'lp_footer_text'    => "Speciality Geochem, उदयपुर · 16 साल\ngrahakavach.in",

			'lp_d_title'        => 'किट कहाँ भेजें?',
			'lp_d_sub'          => 'सिर्फ़ 5 चीज़ें भरनी हैं।',
			'lp_d_note'         => 'आपकी जानकारी सिर्फ़ डिलीवरी के लिए इस्तेमाल होगी।',
			'lp_p_title'        => '{advance} देकर बुकिंग पक्की करें',
			'lp_p_secure'       => 'सुरक्षित भुगतान · Razorpay',
			'lp_done_title'     => 'बुकिंग हो गई।',
			'lp_done_text'      => '{advance} मिल गए। आपकी Graha Kavach किट आज के ऑफ़र के साथ बुक है: {mrp} की किट {price} में।',
			'lp_done_steps'     => "WhatsApp पर बुकिंग की पुष्टि आएगी।\nकिट कूरियर से आपके पते पर पहुँचेगी; ट्रैकिंग WhatsApp पर मिलेगी।\nडिलीवरी पर बाक़ी {balance} दें।",
			'lp_done_wa_label'  => 'WhatsApp पर KAVACH भेजें',
			'lp_wa_keyword'     => 'KAVACH',
			'lp_done_home_label' => 'होम पर वापस जाएँ',
		);
	}

	/**
	 * Bundled image file => field, alt text.
	 *
	 * @return array<string,array{alt:string,title:string}>
	 */
	private static function assets(): array {
		return array(
			'hero-kit.jpg'          => array( 'title' => 'Graha Kavach 3-in-1 kit', 'alt' => 'Graha Kavach 3-in-1 किट: फ़ायर एक्सटिंग्विशर, फ़ायर बॉल, फ़ायर ब्लैंकेट' ),
			'kit-extinguisher.jpg'  => array( 'title' => 'ABC fire extinguisher', 'alt' => '2 किलो ABC फ़ायर एक्सटिंग्विशर' ),
			'kit-fireball.jpg'      => array( 'title' => 'Automatic fire ball', 'alt' => 'ऑटोमैटिक फ़ायर बॉल' ),
			'kit-blanket.jpg'       => array( 'title' => 'Fire blanket', 'alt' => 'फ़ायर ब्लैंकेट' ),
			'where-to-place.jpg'    => array( 'title' => 'Where to place the kit', 'alt' => 'रसोई में फ़ायर ब्लैंकेट, गलियारे में एक्सटिंग्विशर, मीटर के पास फ़ायर बॉल' ),
		);
	}

	/**
	 * Copy a bundled image into the media library, once.
	 *
	 * @param string $file Filename inside assets/landing.
	 * @return int Attachment ID, or 0.
	 */
	private static function import_image( string $file ): int {
		$existing = get_posts(
			array(
				'post_type'   => 'attachment',
				'post_status' => 'inherit',
				'numberposts' => 1,
				'fields'      => 'ids',
				'meta_key'    => '_gk_seed_asset', // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value'  => $file, // phpcs:ignore WordPress.DB.SlowDBQuery
			)
		);

		if ( ! empty( $existing ) ) {
			return (int) $existing[0];
		}

		$source = GK_HEADLESS_DIR . 'assets/landing/' . $file;
		$meta   = self::assets()[ $file ] ?? array( 'title' => $file, 'alt' => '' );

		if ( ! is_readable( $source ) ) {
			return 0;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		// media_handle_sideload() moves the file, so hand it a temporary copy.
		$tmp = wp_tempnam( $file );
		if ( ! $tmp || ! copy( $source, $tmp ) ) {
			return 0;
		}

		$id = media_handle_sideload(
			array(
				'name'     => $file,
				'tmp_name' => $tmp,
			),
			0,
			$meta['title']
		);

		if ( is_wp_error( $id ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink
			@unlink( $tmp );
			return 0;
		}

		update_post_meta( (int) $id, '_wp_attachment_image_alt', $meta['alt'] );
		update_post_meta( (int) $id, '_gk_seed_asset', $file );

		return (int) $id;
	}

	/**
	 * Write starter content once, filling only what is still empty.
	 */
	public static function maybe_seed(): void {
		if ( get_option( self::FLAG ) || ! function_exists( 'update_field' ) || ! current_user_can( 'edit_pages' ) ) {
			return;
		}

		$page_id = self::page_id();
		if ( ! $page_id ) {
			return;
		}

		$empty = static function ( string $name ) use ( $page_id ): bool {
			$value = get_post_meta( $page_id, $name, true );
			return '' === $value || null === $value || array() === $value;
		};

		foreach ( self::copy() as $name => $value ) {
			if ( $empty( $name ) ) {
				update_field( $name, $value, $page_id );
			}
		}

		$images = array();
		foreach ( array_keys( self::assets() ) as $file ) {
			$images[ $file ] = self::import_image( $file );
		}

		$single = array(
			'lp_hero_image'  => $images['hero-kit.jpg'] ?? 0,
			'lp_where_image' => $images['where-to-place.jpg'] ?? 0,
		);
		$lists  = array(
			'lp_kit_images'        => array( $images['kit-extinguisher.jpg'] ?? 0, $images['kit-fireball.jpg'] ?? 0, $images['kit-blanket.jpg'] ?? 0 ),
			'lp_where_tile_images' => array( $images['kit-blanket.jpg'] ?? 0, $images['kit-extinguisher.jpg'] ?? 0, $images['kit-fireball.jpg'] ?? 0 ),
		);

		foreach ( $single as $name => $id ) {
			if ( $id && $empty( $name ) ) {
				update_field( $name, $id, $page_id );
			}
		}
		foreach ( $lists as $name => $ids ) {
			$ids = array_values( array_filter( $ids ) );
			if ( $ids && $empty( $name ) ) {
				update_field( $name, $ids, $page_id );
			}
		}

		// Yoast SEO: starting title and description, editable in the page's Yoast box.
		$seo = array(
			'_yoast_wpseo_title'    => 'Graha Kavach 3-in-1 फ़ायर सेफ़्टी किट: ₹199 में बुक करें',
			'_yoast_wpseo_metadesc' => 'Graha Kavach 3-in-1 होम फ़ायर सेफ़्टी किट सिर्फ़ ₹199 में बुक करें: फ़ायर एक्सटिंग्विशर, फ़ायर बॉल और फ़ायर ब्लैंकेट। मुफ़्त डिलीवरी, कैश ऑन डिलीवरी।',
			'_yoast_wpseo_focuskw'  => 'फ़ायर सेफ़्टी किट',
		);
		foreach ( $seo as $key => $value ) {
			if ( '' === (string) get_post_meta( $page_id, $key, true ) ) {
				update_post_meta( $page_id, $key, $value );
			}
		}

		update_option( self::FLAG, gmdate( 'c' ), false );
	}
}
