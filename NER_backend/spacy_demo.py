"""
pip install spacy
python -m spacy download zh_core_web_trf
python -m spacy download en_core_web_trf
"""
import spacy
import re


def load_models():
    # Load pre-trained models for both Chinese and English
    nlp_zh = spacy.load("zh_core_web_trf")
    nlp_en = spacy.load("en_core_web_trf")
    return nlp_zh, nlp_en


def mask_personal_info(text, nlp_zh, nlp_en):
    # Process text with both models
    doc_zh = nlp_zh(text)
    doc_en = nlp_en(text)

    # Merge entities from both models
    entities = list(doc_zh.ents) + list(doc_en.ents)

    # Define sensitive labels
    sensitive_labels = ['PERSON', 'DATE', 'TIME', 'GPE', 'LOC', 'ORG', 'DATE',
                        'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL']

    # Mask detected entities
    masked_text = text
    for ent in entities:
        if ent.label_ in sensitive_labels:
            masked_text = masked_text.replace(ent.text, "***")

    # Additional patterns for phone numbers, email addresses, and other specific cases
    patterns = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'mobile': r'\+886-\d{2,3}-\d{3,4}-\d{3,4}|\+886\d{9,10}',
        'raw_mobile': r'\b0\d{9,10}\b|\b0\d{2}-\d{3}-\d{3}\b|\b0\d{2}-\d{3}\d{3}\b',
        'raw_tel': r'\b0\d{1,2}-\d{8}\b|\b0\d{1,2}-\d{4}-\d{4}\b|\b0\d{1,2}-\d{3}-\d{4}\b|\b0\d{1,2}-\d{3}-\d{'
                   r'5}\b',
        'tel': r'\+886-\d{1,2}-\d{3,4}-\d{4}|\+886\d{9,10}',
        'id_number': r'\b[A-Z]\d{9}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'bank_account': r'\b\d{2}-\d{2}-\d{4,6}\b'
    }

    for key, pattern in patterns.items():
        masked_text = re.sub(pattern, '***', masked_text)

    return masked_text


def main():
    mail_text = """
    國立清華大學 生物資訊與結構生物研究所 
    INSTITUTE OF BIOINFORMATICS AND STRUCTURAL BIOLOGY 
    NATIONAL TSING HUA UNIVERSITY
    博士候選人畢業論文口試
    The Defense of the Doctoral Dissertation
    題目: 生化網路中雜訊回應的理論與軟體開發
    Title:  Theory and Software Development for Inference of Noise Response in Biochemical Networks
    博士候選人:      艾瑞克同學 (中研院國際研究生學程-生物資訊學程)
    Ph.D. Candidate:  Mr. Erickson Erigio Fajiculay(TIGP-BP)
    時間:     112年4月17日(星期一)下午2:00
    Time:     2:00 PM., Monday, April 17, 2023
    地點:       生命科學二館206室
    Place:     Room 206, Life Science Building II
    主持人: 許昭萍教授、楊立威教授
    Host:     Dr. Chao-Ping Hsu、Dr. Lee-Wei Yang
    
    ※歡迎聽講※
    ******************************
    葉怡君 Jessica Yeh
    國立清華大學生科系所聯合辦公室
    Department of Life Science
    National Tsing Hua University 
    Tel: +886-3-571-5131ext 42745 
    Email:  <mailto:jessica@life.nthu.edu.tw> jessica@life.nthu.edu.tw
    """

    donate_text = """
    編號,捐款者名稱或姓名,捐贈金額(元),捐贈日期,捐贈用途
    1,善心人士,'1,000',1130404,0403地震災害指定捐款
    2,善心人士,500,1130404,0403地震災害指定捐款
    3,張弘毅,'1,000',1130404,0403地震災害指定捐款
    4,顏寧瑶,'1,000',1130404,0403地震災害指定捐款
    5,黃惠俞,'2,000',1130404,0403地震災害指定捐款
    6,林承慧,'5,000',1130404,0403地震災害指定捐款
    7,善心人士,500,1130404,0403地震災害指定捐款
    8,王先生,500,1130404,0403地震災害指定捐款
    9,善心人士,500,1130404,0403地震災害指定捐款
    10,葉嘉玲,'2,000',1130404,0403地震災害指定捐款
    11,吳美慧,200,1130404,0403地震災害指定捐款
    12,吳宇森,'1,000',1130404,0403地震災害指定捐款
    13,鄭浩翔,'1,000',1130404,0403地震災害指定捐款
    14,陳羿綺,'1,000',1130404,0403地震災害指定捐款
    15,柯惠乾,'5,000',1130404,0403地震災害指定捐款
    16,林宜君,'1,000',1130404,0403地震災害指定捐款
    17,善心人士,'1,000',1130404,0403地震災害指定捐款
    18,善心人士,'3,000',1130404,0403地震災害指定捐款
    19,善心人士,'2,000',1130404,0403地震災害指定捐款
    20,善心人士,500,1130404,0403地震災害指定捐款"
    """

    nlp_zh, nlp_en = load_models()
    masked_text = mask_personal_info(mail_text, nlp_zh, nlp_en)
    print(masked_text)
    masked_text = mask_personal_info(donate_text, nlp_zh, nlp_en)
    print(masked_text)


if __name__ == "__main__":
    main()
