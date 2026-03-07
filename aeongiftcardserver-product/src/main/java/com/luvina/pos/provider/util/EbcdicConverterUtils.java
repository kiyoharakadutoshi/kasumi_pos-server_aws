package com.luvina.pos.provider.util;

import org.apache.commons.lang3.StringUtils;

public class EbcdicConverterUtils {

    private EbcdicConverterUtils() {
    }

    public static final char SPACE_FULL_SIZE = '　';

    public static final char ZERO_FULL_SIZE = '０';

    // Unicode char (0–65535) -> EBCDIC byte
    private static final byte[] EBCDIC_ENCODING = new byte[65536];

    static {
        // ===== DIGIT FULL-WIDTH =====
        EBCDIC_ENCODING[ZERO_FULL_SIZE] = (byte) 0xF0;
        EBCDIC_ENCODING['１'] = (byte) 0xF1;
        EBCDIC_ENCODING['２'] = (byte) 0xF2;
        EBCDIC_ENCODING['３'] = (byte) 0xF3;
        EBCDIC_ENCODING['４'] = (byte) 0xF4;
        EBCDIC_ENCODING['５'] = (byte) 0xF5;
        EBCDIC_ENCODING['６'] = (byte) 0xF6;
        EBCDIC_ENCODING['７'] = (byte) 0xF7;
        EBCDIC_ENCODING['８'] = (byte) 0xF8;
        EBCDIC_ENCODING['９'] = (byte) 0xF9;

        // ===== DIGIT HALF-WIDTH =====
        EBCDIC_ENCODING['0'] = (byte) 0xF0;
        EBCDIC_ENCODING['1'] = (byte) 0xF1;
        EBCDIC_ENCODING['2'] = (byte) 0xF2;
        EBCDIC_ENCODING['3'] = (byte) 0xF3;
        EBCDIC_ENCODING['4'] = (byte) 0xF4;
        EBCDIC_ENCODING['5'] = (byte) 0xF5;
        EBCDIC_ENCODING['6'] = (byte) 0xF6;
        EBCDIC_ENCODING['7'] = (byte) 0xF7;
        EBCDIC_ENCODING['8'] = (byte) 0xF8;
        EBCDIC_ENCODING['9'] = (byte) 0xF9;

        // ===== HALF-WIDTH ALPHA =====
        EBCDIC_ENCODING['A'] = (byte) 0xC1;
        EBCDIC_ENCODING['B'] = (byte) 0xC2;
        EBCDIC_ENCODING['C'] = (byte) 0xC3;
        EBCDIC_ENCODING['D'] = (byte) 0xC4;
        EBCDIC_ENCODING['E'] = (byte) 0xC5;
        EBCDIC_ENCODING['F'] = (byte) 0xC6;
        EBCDIC_ENCODING['G'] = (byte) 0xC7;
        EBCDIC_ENCODING['H'] = (byte) 0xC8;
        EBCDIC_ENCODING['I'] = (byte) 0xC9;

        EBCDIC_ENCODING['J'] = (byte) 0xD1;
        EBCDIC_ENCODING['K'] = (byte) 0xD2;
        EBCDIC_ENCODING['L'] = (byte) 0xD3;
        EBCDIC_ENCODING['M'] = (byte) 0xD4;
        EBCDIC_ENCODING['N'] = (byte) 0xD5;
        EBCDIC_ENCODING['O'] = (byte) 0xD6;
        EBCDIC_ENCODING['P'] = (byte) 0xD7;
        EBCDIC_ENCODING['Q'] = (byte) 0xD8;
        EBCDIC_ENCODING['R'] = (byte) 0xD9;

        EBCDIC_ENCODING['S'] = (byte) 0xE2;
        EBCDIC_ENCODING['T'] = (byte) 0xE3;
        EBCDIC_ENCODING['U'] = (byte) 0xE4;
        EBCDIC_ENCODING['V'] = (byte) 0xE5;
        EBCDIC_ENCODING['W'] = (byte) 0xE6;
        EBCDIC_ENCODING['X'] = (byte) 0xE7;
        EBCDIC_ENCODING['Y'] = (byte) 0xE8;
        EBCDIC_ENCODING['Z'] = (byte) 0xE9;

        EBCDIC_ENCODING['a'] = (byte) 0x62;
        EBCDIC_ENCODING['b'] = (byte) 0x63;
        EBCDIC_ENCODING['c'] = (byte) 0x64;
        EBCDIC_ENCODING['d'] = (byte) 0x65;
        EBCDIC_ENCODING['e'] = (byte) 0x66;
        EBCDIC_ENCODING['f'] = (byte) 0x67;
        EBCDIC_ENCODING['g'] = (byte) 0x68;
        EBCDIC_ENCODING['h'] = (byte) 0x69;

        EBCDIC_ENCODING['i'] = (byte) 0x71;
        EBCDIC_ENCODING['j'] = (byte) 0x72;
        EBCDIC_ENCODING['k'] = (byte) 0x73;
        EBCDIC_ENCODING['l'] = (byte) 0x74;
        EBCDIC_ENCODING['m'] = (byte) 0x75;
        EBCDIC_ENCODING['n'] = (byte) 0x76;
        EBCDIC_ENCODING['o'] = (byte) 0x77;
        EBCDIC_ENCODING['p'] = (byte) 0x78;

        EBCDIC_ENCODING['q'] = (byte) 0x8B;
        EBCDIC_ENCODING['r'] = (byte) 0x9B;
        EBCDIC_ENCODING['s'] = (byte) 0xAB;
        EBCDIC_ENCODING['t'] = (byte) 0xB3;
        EBCDIC_ENCODING['u'] = (byte) 0xB4;
        EBCDIC_ENCODING['v'] = (byte) 0xB5;
        EBCDIC_ENCODING['w'] = (byte) 0xB6;
        EBCDIC_ENCODING['x'] = (byte) 0xB7;
        EBCDIC_ENCODING['y'] = (byte) 0xB8;
        EBCDIC_ENCODING['z'] = (byte) 0xB9;

        // ===== FULL-WIDTH ALPHA =====
        EBCDIC_ENCODING['Ａ'] = (byte) 0xC1;
        EBCDIC_ENCODING['Ｂ'] = (byte) 0xC2;
        EBCDIC_ENCODING['Ｃ'] = (byte) 0xC3;
        EBCDIC_ENCODING['Ｄ'] = (byte) 0xC4;
        EBCDIC_ENCODING['Ｅ'] = (byte) 0xC5;
        EBCDIC_ENCODING['Ｆ'] = (byte) 0xC6;
        EBCDIC_ENCODING['Ｇ'] = (byte) 0xC7;
        EBCDIC_ENCODING['Ｈ'] = (byte) 0xC8;
        EBCDIC_ENCODING['Ｉ'] = (byte) 0xC9;

        EBCDIC_ENCODING['Ｊ'] = (byte) 0xD1;
        EBCDIC_ENCODING['Ｋ'] = (byte) 0xD2;
        EBCDIC_ENCODING['Ｌ'] = (byte) 0xD3;
        EBCDIC_ENCODING['Ｍ'] = (byte) 0xD4;
        EBCDIC_ENCODING['Ｎ'] = (byte) 0xD5;
        EBCDIC_ENCODING['Ｏ'] = (byte) 0xD6;
        EBCDIC_ENCODING['Ｐ'] = (byte) 0xD7;
        EBCDIC_ENCODING['Ｑ'] = (byte) 0xD8;
        EBCDIC_ENCODING['Ｒ'] = (byte) 0xD9;

        EBCDIC_ENCODING['Ｓ'] = (byte) 0xE2;
        EBCDIC_ENCODING['Ｔ'] = (byte) 0xE3;
        EBCDIC_ENCODING['Ｕ'] = (byte) 0xE4;
        EBCDIC_ENCODING['Ｖ'] = (byte) 0xE5;
        EBCDIC_ENCODING['Ｗ'] = (byte) 0xE6;
        EBCDIC_ENCODING['Ｘ'] = (byte) 0xE7;
        EBCDIC_ENCODING['Ｙ'] = (byte) 0xE8;
        EBCDIC_ENCODING['Ｚ'] = (byte) 0xE9;

        EBCDIC_ENCODING['ａ'] = (byte) 0x62;
        EBCDIC_ENCODING['ｂ'] = (byte) 0x63;
        EBCDIC_ENCODING['ｃ'] = (byte) 0x64;
        EBCDIC_ENCODING['ｄ'] = (byte) 0x65;
        EBCDIC_ENCODING['ｅ'] = (byte) 0x66;
        EBCDIC_ENCODING['ｆ'] = (byte) 0x67;
        EBCDIC_ENCODING['ｇ'] = (byte) 0x68;
        EBCDIC_ENCODING['ｈ'] = (byte) 0x69;

        EBCDIC_ENCODING['ｉ'] = (byte) 0x71;
        EBCDIC_ENCODING['ｊ'] = (byte) 0x72;
        EBCDIC_ENCODING['ｋ'] = (byte) 0x73;
        EBCDIC_ENCODING['ｌ'] = (byte) 0x74;
        EBCDIC_ENCODING['ｍ'] = (byte) 0x75;
        EBCDIC_ENCODING['ｎ'] = (byte) 0x76;
        EBCDIC_ENCODING['ｏ'] = (byte) 0x77;
        EBCDIC_ENCODING['ｐ'] = (byte) 0x78;

        EBCDIC_ENCODING['ｑ'] = (byte) 0x8B;
        EBCDIC_ENCODING['ｒ'] = (byte) 0x9B;
        EBCDIC_ENCODING['ｓ'] = (byte) 0xAB;
        EBCDIC_ENCODING['ｔ'] = (byte) 0xB3;
        EBCDIC_ENCODING['ｕ'] = (byte) 0xB4;
        EBCDIC_ENCODING['ｖ'] = (byte) 0xB5;
        EBCDIC_ENCODING['ｗ'] = (byte) 0xB6;
        EBCDIC_ENCODING['ｘ'] = (byte) 0xB7;
        EBCDIC_ENCODING['ｙ'] = (byte) 0xB8;
        EBCDIC_ENCODING['ｚ'] = (byte) 0xB9;

        // ===== KATAKANA SBCS (CORE SET) =====
        EBCDIC_ENCODING['ア'] = (byte) 0x81;
        EBCDIC_ENCODING['イ'] = (byte) 0x82;
        EBCDIC_ENCODING['ウ'] = (byte) 0x83;
        EBCDIC_ENCODING['エ'] = (byte) 0x84;
        EBCDIC_ENCODING['オ'] = (byte) 0x85;
        EBCDIC_ENCODING['カ'] = (byte) 0x86;
        EBCDIC_ENCODING['キ'] = (byte) 0x87;
        EBCDIC_ENCODING['ク'] = (byte) 0x88;
        EBCDIC_ENCODING['ケ'] = (byte) 0x89;
        EBCDIC_ENCODING['コ'] = (byte) 0x8A;
        EBCDIC_ENCODING['サ'] = (byte) 0x8C;
        EBCDIC_ENCODING['シ'] = (byte) 0x8D;
        EBCDIC_ENCODING['ス'] = (byte) 0x8E;
        EBCDIC_ENCODING['セ'] = (byte) 0x8F;

        EBCDIC_ENCODING['ソ'] = (byte) 0x90;
        EBCDIC_ENCODING['タ'] = (byte) 0x91;
        EBCDIC_ENCODING['チ'] = (byte) 0x92;
        EBCDIC_ENCODING['ツ'] = (byte) 0x93;
        EBCDIC_ENCODING['テ'] = (byte) 0x94;
        EBCDIC_ENCODING['ト'] = (byte) 0x95;
        EBCDIC_ENCODING['ナ'] = (byte) 0x96;
        EBCDIC_ENCODING['ニ'] = (byte) 0x97;
        EBCDIC_ENCODING['ヌ'] = (byte) 0x98;
        EBCDIC_ENCODING['ネ'] = (byte) 0x99;
        EBCDIC_ENCODING['ノ'] = (byte) 0x9A;
        EBCDIC_ENCODING['ハ'] = (byte) 0x9D;
        EBCDIC_ENCODING['ヒ'] = (byte) 0x9E;
        EBCDIC_ENCODING['フ'] = (byte) 0x9F;

        EBCDIC_ENCODING['ヘ'] = (byte) 0xA2;
        EBCDIC_ENCODING['ホ'] = (byte) 0xA3;
        EBCDIC_ENCODING['マ'] = (byte) 0xA4;
        EBCDIC_ENCODING['ミ'] = (byte) 0xA5;
        EBCDIC_ENCODING['ム'] = (byte) 0xA6;
        EBCDIC_ENCODING['メ'] = (byte) 0xA7;
        EBCDIC_ENCODING['モ'] = (byte) 0xA8;
        EBCDIC_ENCODING['ヤ'] = (byte) 0xA9;
        EBCDIC_ENCODING['ユ'] = (byte) 0xAA;
        EBCDIC_ENCODING['ヨ'] = (byte) 0xAC;
        EBCDIC_ENCODING['ラ'] = (byte) 0xAD;
        EBCDIC_ENCODING['リ'] = (byte) 0xAE;
        EBCDIC_ENCODING['ル'] = (byte) 0xAF;

        EBCDIC_ENCODING['レ'] = (byte) 0xBA;
        EBCDIC_ENCODING['ロ'] = (byte) 0xBB;
        EBCDIC_ENCODING['ワ'] = (byte) 0xBC;
        EBCDIC_ENCODING['ン'] = (byte) 0xBD;

        // ===== SYMBOL FULL SIZE =====
        EBCDIC_ENCODING[SPACE_FULL_SIZE] = (byte) 0x40; // full-width space

        EBCDIC_ENCODING['－'] = (byte) 0x60; // minus (*2)
        EBCDIC_ENCODING['／'] = (byte) 0x61;

        EBCDIC_ENCODING['['] = (byte) 0x4A;
        EBCDIC_ENCODING['．'] = (byte) 0x4B; // period (*1)
        EBCDIC_ENCODING['＜'] = (byte) 0x4C;
        EBCDIC_ENCODING['（'] = (byte) 0x4D;
        EBCDIC_ENCODING['＋'] = (byte) 0x4E;
        EBCDIC_ENCODING['！'] = (byte) 0x4F;

        EBCDIC_ENCODING[']'] = (byte) 0x5A;
        EBCDIC_ENCODING['￥'] = (byte) 0x5B;
        EBCDIC_ENCODING['＊'] = (byte) 0x5C;
        EBCDIC_ENCODING['）'] = (byte) 0x5D;
        EBCDIC_ENCODING['；'] = (byte) 0x5E;
        EBCDIC_ENCODING['⋀'] = (byte) 0x5F;

        EBCDIC_ENCODING['，'] = (byte) 0x6B; // comma (*3)
        EBCDIC_ENCODING['％'] = (byte) 0x6C;
        EBCDIC_ENCODING['＿'] = (byte) 0x6D; // underline (*4)
        EBCDIC_ENCODING['＞'] = (byte) 0x6E;
        EBCDIC_ENCODING['？'] = (byte) 0x6F;

        EBCDIC_ENCODING['：'] = (byte) 0x7A;
        EBCDIC_ENCODING['＃'] = (byte) 0x7B;
        EBCDIC_ENCODING['＠'] = (byte) 0x7C;
        EBCDIC_ENCODING['‘'] = (byte) 0x7D;
        EBCDIC_ENCODING['＝'] = (byte) 0x7E;
        EBCDIC_ENCODING['“'] = (byte) 0x7F;

        EBCDIC_ENCODING['゛'] = (byte) 0xBE; //(*5)
        EBCDIC_ENCODING['゜'] = (byte) 0xBF; //(*6)

        // ===== SYMBOL HALF SIZE=====
        EBCDIC_ENCODING[' '] = (byte) 0x40;

        EBCDIC_ENCODING['-'] = (byte) 0x60;
        EBCDIC_ENCODING['/'] = (byte) 0x61;

        EBCDIC_ENCODING['.'] = (byte) 0x4B;
        EBCDIC_ENCODING['<'] = (byte) 0x4C;
        EBCDIC_ENCODING['('] = (byte) 0x4D;
        EBCDIC_ENCODING['+'] = (byte) 0x4E;
        EBCDIC_ENCODING['!'] = (byte) 0x4F;

        EBCDIC_ENCODING['*'] = (byte) 0x5C;
        EBCDIC_ENCODING[')'] = (byte) 0x5D;
        EBCDIC_ENCODING[';'] = (byte) 0x5E;

        EBCDIC_ENCODING[','] = (byte) 0x6B;
        EBCDIC_ENCODING['%'] = (byte) 0x6C;
        EBCDIC_ENCODING['_'] = (byte) 0x6D;
        EBCDIC_ENCODING['>'] = (byte) 0x6E;
        EBCDIC_ENCODING['?'] = (byte) 0x6F;

        EBCDIC_ENCODING[':'] = (byte) 0x7A;
        EBCDIC_ENCODING['#'] = (byte) 0x7B;
        EBCDIC_ENCODING['@'] = (byte) 0x7C;
        EBCDIC_ENCODING['\''] = (byte) 0x7D;
        EBCDIC_ENCODING['='] = (byte) 0x7E;
        EBCDIC_ENCODING['"'] = (byte) 0x7F;
    }

    public static byte[] encodeSBCS(String s, byte defaultValue) {
        byte[] out = new byte[s.length()];
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            byte b = EBCDIC_ENCODING[c];
            if (b == 0) {
                out[i] = defaultValue;
            } else {
                out[i] = b;
            }
        }
        return out;
    }

    /**
     * Convert number to EBCDIC with '0' padding on the left
     *
     * @param data       Object containing number (Integer, Long, String number, etc.)
     * @param lengthByte Fixed byte length
     * @return EBCDIC byte array with length = lengthByte
     * <p>
     * Example:
     * convertNumberEBCDIC(25,  3) → [0xF0, 0xF2, 0xF5] ("025")
     * convertNumberEBCDIC(5,  3) → [0xF0, 0xF0, 0xF5] ("005")
     */
    public static byte[] convertNumberHalfSizeEBCDIC(Object data, int lengthByte) {
        String value = data == null ? "" : data.toString();
        String formatted = StringUtils.leftPad(value, lengthByte, '0');

        // Truncate if too long
        if (formatted.length() > lengthByte) {
            formatted = formatted.substring(0, lengthByte);
        }

        // Convert to EBCDIC using Charset
        return encodeSBCS(formatted, EBCDIC_ENCODING[ZERO_FULL_SIZE]);
    }

    public static <T> byte[] convertRightCharacterEBCDIC(Object data, Class<T> clazz, int lengthByte) {
        return convertCharacterEBCDIC(data, clazz, lengthByte, true);
    }

    public static <T> byte[] convertLeftCharacterEBCDIC(Object data, Class<T> clazz, int lengthByte) {
        return convertCharacterEBCDIC(data, clazz, lengthByte, false);
    }

    /**
     * Convert text/character to EBCDIC with space padding on the right
     *
     * @param data       Object containing text (String, Character, etc.)
     * @param clazz      Class type for casting
     * @param lengthByte Fixed byte length
     * @param <T>        Type parameter
     * @return EBCDIC byte array with length = lengthByte
     * <p>
     * Example:
     * convertCharacterEBCDIC("AB", String.class, 4) → [0xC1, 0xC2, 0x40, 0x40] ("  AB")
     * convertCharacterEBCDIC("john", String.class, 4) → [0x91, 0x96, 0x88, 0x95] ("john")
     */
    public static <T> byte[] convertCharacterEBCDIC(Object data, Class<T> clazz, int lengthByte, boolean isRight) {

        // Convert data to string and remove control characters
        String text = convertToString(data, clazz);

        // Format with space padding on the right (left-aligned)
        String formatted =  isRight ? String.format("%" + lengthByte + "s", text) : String.format("%-" + lengthByte + "s", text);

        // Truncate if too long
        if (formatted.length() > lengthByte) {
            formatted = formatted.substring(0, lengthByte);
        }

        // Convert to EBCDIC using Charset
        return encodeSBCS(formatted, EBCDIC_ENCODING[SPACE_FULL_SIZE]);
    }

    /**
     * Convert Object to String and remove control characters
     */
    private static <T> String convertToString(Object data, Class<T> clazz) {
        if (data == null) {
            return "";
        }

        String text;
        if (clazz == String.class) {
            text = (String) data;
        } else if (clazz == Character.class || clazz == char.class) {
            text = String.valueOf(data);
        } else {
            text = String.valueOf(data);
        }

        return text;
    }

    /**
     * Helper method: Convert byte array to readable hex string (for debugging)
     */
    public static String toHexString(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X ", b & 0xFF));
        }
        return sb.toString().trim();
    }

}
