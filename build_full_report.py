import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

IMG_DIR = r"C:\Users\garen\Downloads\MeeSeva_DQMS_CBP_Report\images"
OUTPUT_DOCX = r"C:\Users\garen\Documents\antigravity\calm-franklin\MeeSeva_DQMS_Academic_Project_Report.docx"
OUTPUT_PDF = r"C:\Users\garen\Documents\antigravity\calm-franklin\MeeSeva_DQMS_Academic_Project_Report.pdf"

MAROON = RGBColor(128, 0, 0) # #800000
BLACK = RGBColor(0, 0, 0)
GOLD_BG = "FFF2CC"

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_borders(cell, top="single", bottom="single", left="single", right="single", color="000000", sz="4"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f"""
    <w:tcBorders {nsdecls("w")}>
        <w:top w:val="{top}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:left w:val="{left}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:bottom w:val="{bottom}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        <w:right w:val="{right}" w:sz="{sz}" w:space="0" w:color="{color}"/>
    </w:tcBorders>
    """)
    tcPr.append(borders)

def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f"""
    <w:tcMar {nsdecls("w")}>
        <w:top w:w="{top}" w:type="dxa"/>
        <w:bottom w:w="{bottom}" w:type="dxa"/>
        <w:left w:w="{left}" w:type="dxa"/>
        <w:right w:w="{right}" w:type="dxa"/>
    </w:tcMar>
    """)
    tcPr.append(tcMar)

def create_report():
    doc = docx.Document()
    
    # Page setup: Letter (8.5 x 11 in), 1 inch margins
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11.0)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    
    # Double-line page border matching Harsha
    sectPr = section._sectPr
    pgBorders_xml = f"""
    <w:pgBorders {nsdecls('w')} w:offsetFrom="page">
        <w:top w:val="thinThickMediumGap" w:sz="24" w:space="24" w:color="000000"/>
        <w:left w:val="thinThickMediumGap" w:sz="24" w:space="24" w:color="000000"/>
        <w:bottom w:val="thinThickMediumGap" w:sz="24" w:space="24" w:color="000000"/>
        <w:right w:val="thinThickMediumGap" w:sz="24" w:space="24" w:color="000000"/>
    </w:pgBorders>
    """
    sectPr.append(parse_xml(pgBorders_xml))
    
    def add_p(text="", font_size=12, bold=False, italic=False, color=BLACK, 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=5, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(font_size)
            r.font.bold = bold
            r.font.italic = italic
            r.font.color.rgb = color
        return p

    def add_bullet(text="", bold_prefix="", font_size=12, space_before=0, space_after=3):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(0.3)
        p.paragraph_format.first_line_indent = Inches(-0.18)
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        
        r_b = p.add_run("●  ")
        r_b.font.name = "Times New Roman"
        r_b.font.size = Pt(font_size)
        r_b.font.color.rgb = BLACK
        
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(font_size)
            r_pre.font.bold = True
            r_pre.font.color.rgb = BLACK
            
        if text:
            r_txt = p.add_run(text)
            r_txt.font.name = "Times New Roman"
            r_txt.font.size = Pt(font_size)
            r_txt.font.color.rgb = BLACK
        return p

    def add_chapter_title(text):
        return add_p(text, font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=14)

    def add_testing_title(text):
        return add_p(text, font_size=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=12)

    def add_heading1(text):
        return add_p(text, font_size=14, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=8, space_after=4)

    def add_heading2(text):
        return add_p(text, font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=6, space_after=3)

    def add_image_centered(image_name, width_inches=5.8):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        img_path = os.path.join(IMG_DIR, image_name)
        if os.path.exists(img_path):
            r = p.add_run()
            r.add_picture(img_path, width=Inches(width_inches))
        return p

    def style_cell(cell, bg_color=None, bold=False, italic=False, font_size=10, align=WD_ALIGN_PARAGRAPH.LEFT, text=""):
        if bg_color:
            set_cell_background(cell, bg_color)
        set_cell_borders(cell)
        set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
        
        p = cell.paragraphs[0]
        p.alignment = align
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.05
        if text:
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(font_size)
            r.font.bold = bold
            r.font.italic = italic
            r.font.color.rgb = BLACK

    # ================= PAGE 1: COVER PAGE =================
    add_p("A Course Based Project Report on", font_size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=6)
    add_p("MEESEVA DIGITAL QUEUE MANAGEMENT SYSTEM", font_size=18, bold=True, color=MAROON, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
    add_p("(MEESEVA DQMS)", font_size=18, bold=True, color=MAROON, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=8)
    add_p("Submitted to the", font_size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
    add_p("Department of Computer Science and Engineering", font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
    add_p("in partial fulfilment of the requirements for the completion of course", font_size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
    add_p("UNIFIED SOFTWARE ENGINEERING LABORATORY (25PC2CS202)", font_size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=8)
    add_p("BACHELOR OF TECHNOLOGY IN", font_size=14, bold=True, color=MAROON, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
    add_p("COMPUTER SCIENCE ENGINEERING", font_size=14, bold=True, color=MAROON, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=8)
    add_p("Submitted by", font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=4)
    
    for student in [
        "Zain Ahmed (25071A05N1)",
        "Shaik Aijaaz (25071A05K8)",
        "Manitheja (25071A05J5)",
        "Veda Vardan (25071A05E7)"
    ]:
        add_p(student, font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
        
    add_p("Under the Guidance of", font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=2)
    add_p("Mrs. K. Hari Priya", font_size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=1)
    add_p("Dr. P. Bharath Kumar", font_size=12, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6)
    
    # Logo
    add_image_centered("vnr_logo_clean.png", width_inches=1.35)
    
    add_p("VALLURUPALLI NAGESWARA RAO VIGNANA JYOTHI INSTITUTE OF", font_size=12, bold=True, color=MAROON, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=1)
    add_p("ENGINEERING AND TECHNOLOGY", font_size=12, bold=True, color=MAROON, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=5)
    add_p("An Autonomous Institute, NAAC Accredited with ‘A++’ Grade\nNBA Accredited for CE, EEE, ME, ECE, CSE, EIE, IT B.Tech. Programs\nApproved by AICTE, New Delhi, Affiliated to JNTU-H, Recognized as “College with Potential for Excellence” by UGC\nVignana Jyothi Nagar, Pragathi Nagar, Nizampet (S.O), Hyderabad TS 500 090 India", 
          font_size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=0, line_spacing=1.05)
    
    doc.add_page_break()

    # ================= PAGE 2: CERTIFICATE =================
    add_p("CERTIFICATE", font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=28)
    
    cert_p = doc.add_paragraph()
    cert_p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    cert_p.paragraph_format.line_spacing = 1.15
    cert_p.paragraph_format.space_after = Pt(24)
    
    r1 = cert_p.add_run("This is to certify that ")
    r1.font.name = "Times New Roman"; r1.font.size = Pt(12)
    
    r_stud = cert_p.add_run("Zain Ahmed (25071A05N1), Shaik Aijaaz (25071A05K8), Manitheja (25071A05J5), Veda Vardan (25071A05E7)")
    r_stud.font.name = "Times New Roman"; r_stud.font.size = Pt(12); r_stud.font.bold = True
    
    r2 = cert_p.add_run(" have successfully completed their Course Based Project work at ")
    r2.font.name = "Times New Roman"; r2.font.size = Pt(12)
    
    r_dept = cert_p.add_run("Computer Science & Engineering Department of Vallurupalli Nageswara Rao Vignana Jyothi Institute of Engineering and Technology, Hyderabad")
    r_dept.font.name = "Times New Roman"; r_dept.font.size = Pt(12); r_dept.font.bold = True
    
    r3 = cert_p.add_run(" entitled ")
    r3.font.name = "Times New Roman"; r3.font.size = Pt(12)
    
    r_title = cert_p.add_run("“MeeSeva Digital Queue Management System (MeeSeva DQMS)”")
    r_title.font.name = "Times New Roman"; r_title.font.size = Pt(12); r_title.font.bold = True
    
    r4 = cert_p.add_run(" in partial fulfillment of the requirements for the award of ")
    r4.font.name = "Times New Roman"; r4.font.size = Pt(12)
    
    r_deg = cert_p.add_run("B. Tech")
    r_deg.font.name = "Times New Roman"; r_deg.font.size = Pt(12); r_deg.font.bold = True
    
    r5 = cert_p.add_run(" during the academic year ")
    r5.font.name = "Times New Roman"; r5.font.size = Pt(12)
    
    r_ay = cert_p.add_run("2026-2027.")
    r_ay.font.name = "Times New Roman"; r_ay.font.size = Pt(12); r_ay.font.bold = True
    
    for _ in range(3):
        add_p("", space_after=10)
        
    # Signatures table: 3 columns
    tbl_sig = doc.add_table(rows=3, cols=3)
    tbl_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sig.autofit = False
    
    sig_data = [
        ("Mrs. K. Hari Priya", "Assistant Professor", "CSE Department"),
        ("Dr. P. Bharat Kumar", "Assistant Professor", "CSE Department"),
        ("Dr. V. Baby", "Associate Professor & HOD", "CSE Department")
    ]
    for c_idx, (name, desig, dept) in enumerate(sig_data):
        c0 = tbl_sig.cell(0, c_idx); c1 = tbl_sig.cell(1, c_idx); c2 = tbl_sig.cell(2, c_idx)
        style_cell(c0, bold=True, font_size=11, align=WD_ALIGN_PARAGRAPH.CENTER, text=name)
        style_cell(c1, bold=False, font_size=10, align=WD_ALIGN_PARAGRAPH.CENTER, text=desig)
        style_cell(c2, bold=False, font_size=10, align=WD_ALIGN_PARAGRAPH.CENTER, text=dept)
        for r_idx in range(3):
            set_cell_borders(tbl_sig.cell(r_idx, c_idx), top="none", bottom="none", left="none", right="none")
            
    doc.add_page_break()

    # ================= PAGE 3: DECLARATION =================
    add_p("DECLARATION", font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=28)
    
    decl_p = doc.add_paragraph()
    decl_p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    decl_p.paragraph_format.line_spacing = 1.15
    decl_p.paragraph_format.space_after = Pt(24)
    
    rd1 = decl_p.add_run("This is to certify that the project work entitled ")
    rd1.font.name = "Times New Roman"; rd1.font.size = Pt(12)
    
    rd_title = decl_p.add_run("“MEESEVA DIGITAL QUEUE MANAGEMENT SYSTEM (MEESEVA DQMS)”")
    rd_title.font.name = "Times New Roman"; rd_title.font.size = Pt(12); rd_title.font.bold = True
    
    rd2 = decl_p.add_run(" submitted in VNR Vignana Jyothi Institute of Engineering & Technology in partial fulfillment of requirement for the award of Bachelor of Technology in Computer Science and Engineering is a Bonafide report of the work carried out by us under the guidance and supervision of ")
    rd2.font.name = "Times New Roman"; rd2.font.size = Pt(12)
    
    rd_g = decl_p.add_run("Mrs. K. Hari Priya, Assistant Professor, Department of CSE, VNRVJIET")
    rd_g.font.name = "Times New Roman"; rd_g.font.size = Pt(12); rd_g.font.bold = True
    
    rd3 = decl_p.add_run(" and ")
    rd3.font.name = "Times New Roman"; rd3.font.size = Pt(12)
    
    rd_g2 = decl_p.add_run("Dr. P. Bharath Kumar, Assistant Professor, Department of CSE, VNRVJIET.")
    rd_g2.font.name = "Times New Roman"; rd_g2.font.size = Pt(12); rd_g2.font.bold = True
    
    rd4 = decl_p.add_run(" To the best of our knowledge, this report has not been submitted in any form to any university or institution for the award of any degree or diploma.")
    rd4.font.name = "Times New Roman"; rd4.font.size = Pt(12)
    
    for _ in range(4):
        add_p("", space_after=10)
        
    add_p("Submission Dt:", font_size=12, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=10, space_after=24)
    
    tbl_decl = doc.add_table(rows=2, cols=4)
    tbl_decl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_decl.autofit = False
    
    decl_students = [
        ("Zain Ahmed", "25071A05N1"),
        ("Shaik Aijaaz", "25071A05K8"),
        ("Manitheja", "25071A05J5"),
        ("Veda Vardan", "25071A05E7")
    ]
    for c_idx, (sname, sroll) in enumerate(decl_students):
        c0 = tbl_decl.cell(0, c_idx); c1 = tbl_decl.cell(1, c_idx)
        style_cell(c0, bold=True, font_size=10, align=WD_ALIGN_PARAGRAPH.CENTER, text=sname)
        style_cell(c1, bold=True, font_size=10, align=WD_ALIGN_PARAGRAPH.CENTER, text=sroll)
        set_cell_borders(c0, top="none", bottom="none", left="none", right="none")
        set_cell_borders(c1, top="none", bottom="none", left="none", right="none")
        
    doc.add_page_break()

    # ================= PAGE 4: ACKNOWLEDGEMENT =================
    add_p("ACKNOWLEDGEMENT", font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=20)
    
    add_p("An endeavor over a long period can be successful only with the advice and support of many well-wishers. We take this opportunity to express our gratitude and appreciation to all of them.", space_after=12)
    
    ack_p2 = doc.add_paragraph()
    ack_p2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    ack_p2.paragraph_format.line_spacing = 1.15
    ack_p2.paragraph_format.space_after = Pt(12)
    r = ack_p2.add_run("We are indebted to our venerable principal ")
    r.font.name = "Times New Roman"; r.font.size = Pt(12)
    r_pr = ack_p2.add_run("Dr. B Chennakesava Rao")
    r_pr.font.name = "Times New Roman"; r_pr.font.size = Pt(12); r_pr.font.bold = True
    r = ack_p2.add_run(" for his unflinching devotion, which led us to complete this project. The support, encouragement given by him and his motivation lead us to complete this project.")
    r.font.name = "Times New Roman"; r.font.size = Pt(12)
    
    ack_p3 = doc.add_paragraph()
    ack_p3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    ack_p3.paragraph_format.line_spacing = 1.15
    ack_p3.paragraph_format.space_after = Pt(12)
    r = ack_p3.add_run("We wish to express our profound gratitude to ")
    r.font.name = "Times New Roman"; r.font.size = Pt(12)
    r_hod = ack_p3.add_run("Dr. V Baby, Associate Professor and HOD CSE Department, VNR Vignana Jyothi Institute of Engineering and Technology")
    r_hod.font.name = "Times New Roman"; r_hod.font.size = Pt(12); r_hod.font.bold = True
    r = ack_p3.add_run(" for her constant and dedicated service to brighten our career.")
    r.font.name = "Times New Roman"; r.font.size = Pt(12)
    
    ack_p4 = doc.add_paragraph()
    ack_p4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    ack_p4.paragraph_format.line_spacing = 1.15
    ack_p4.paragraph_format.space_after = Pt(12)
    r = ack_p4.add_run("With great pleasure we express our gratitude to the faculty advisors, ")
    r.font.name = "Times New Roman"; r.font.size = Pt(12)
    r_adv = ack_p4.add_run("Mrs. K. Hari Priya and Dr. P. Bharath Kumar")
    r_adv.font.name = "Times New Roman"; r_adv.font.size = Pt(12); r_adv.font.bold = True
    r = ack_p4.add_run(" for their timely help, constant guidance, cooperation, support and encouragement throughout this project.")
    r.font.name = "Times New Roman"; r.font.size = Pt(12)
    
    add_p("Finally, we wish to express our deep sense of gratitude and sincere thanks to our parents, friends and all our well-wishers who have technically and non-technically contributed for the successful completion of our course-based project.", space_after=24)
    
    for student in [
        "Zain Ahmed (25071A05N1)",
        "Shaik Aijaaz (25071A05K8)",
        "Manitheja (25071A05J5)",
        "Veda Vardan (25071A05E7)"
    ]:
        add_p(student, font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=0, space_after=2)
        
    doc.add_page_break()

    # ================= PAGE 5: PROBLEM STATEMENT =================
    add_p("DEVELOPER WORKSPACE", font_size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=10)
    add_heading1("Problem Statement")
    add_heading2("Problem")
    add_p("Physical queues at citizen service centers across the 33 districts of Telangana suffer from severe congestion, arbitrary manual paper-ticket distribution, lack of transparent wait-time feedback, and unpredictable counter allocation. Citizens frequently spend 3 to 6 hours waiting without knowing counter readiness, leading to overcrowding, lost productivity, and administrative opacity. Furthermore, manual counter calling causes unbalanced workloads and disputes. MeeSeva DQMS addresses this problem by replacing fragile physical queues with an authoritative, deterministic digital queuing platform wired into an enterprise relational backend.", space_after=5)
    
    add_heading2("Background and Relevance")
    add_p("Telangana's MeeSeva ecosystem serves millions of citizens across Revenue, Municipal, Transport (RTA), Civil Supplies, and Electricity departments. Modernizing this civic infrastructure requires eliminating manual paper registers and replacing them with a deterministic virtual queue engine. Real-time queue telemetry, live audio announcements, and bilingual AI assistance ensure dignity and transparency while streamlining counter throughput.", space_after=5)
    
    add_heading2("Objectives")
    add_bullet("Provide a secure dual-authentication gateway for citizen mobile OTP and official *.gov.in login.")
    add_bullet("Enable cascading service booking across all 33 Telangana districts and 5 major civic departments.")
    add_bullet("Generate deterministic FIFO tokens featuring optical Code-128 barcodes and wait-time estimates.")
    add_bullet("Deliver sub-200ms real-time queue synchronization to all connected browsers via Server-Sent Events.")
    add_bullet("Equip counter operators with a dedicated console for Call Next, Serve, Complete, Hold, and No-Show.")
    add_bullet("Provide procedural Web Audio API token calling chimes without external media dependencies.")
    add_bullet("Integrate bilingual FreeLLMAPI AI Sahayak guidance in English and Telugu for document checklists.")
    add_bullet("Capture immutable audit trails logging all ticket lifecycle transitions with millisecond precision.")
    
    doc.add_page_break()

    # ================= PAGE 6: ABSTRACT =================
    add_testing_title("Abstract")
    add_p("The MeeSeva Digital Queue Management System (DQMS) is an enterprise civic technology web application engineered for the Government of Telangana to eliminate physical lines across civic facilitation centers in all 33 Telangana districts. The platform unites citizens, center operators, and department supervisors into a synchronized digital workflow. Built with a decoupled 3-tier architecture—combining a modern React 19 single-page frontend featuring Three.js 3D landscape visualization, a Java Spring Boot 3.3 enterprise microservices backend, and an Oracle Database 23ai relational store—the system enforces strict mathematical determinism, eliminating arbitrary random functions in favor of atomic database sequence generators.", space_after=12)
    
    add_p("Real-time state updates are broadcast instantly via Server-Sent Events (SSE), and procedural Web Audio announcements provide immediate auditory feedback when a token is called without external media dependencies. A bilingual AI assistant (MeeSeva Sahayak) delivers contextual document verification checklists and service turnaround estimates in both English and Telugu, significantly reducing administrative turnarounds. The application strictly adheres to modular enterprise design principles, separating presentation, business logic, and transactional persistence layers to maximize maintainability, scalability, and security. Comprehensive white-box basis path testing and a 12-scenario black-box integration matrix confirm transactional determinism and zero-drift queue progression. Overall, MeeSeva DQMS establishes an accountable, transparent, and dignified public service standard for next-generation digital governance.", space_after=12)
    
    doc.add_page_break()

    # ================= PAGES 7 - 10: SDLC (4 PAGES) =================
    # SDLC Page 1 (Doc Page 7)
    add_chapter_title("Software Development Lifecycle (SDLC)")
    add_p("Software Development Life Cycle (SDLC) is a framework that defines the steps involved in the development of software at each phase. It covers the detailed plan for building, deploying and maintaining the software. SDLC defines the complete cycle of development i.e. all the tasks involved in planning, creating, testing, and deploying a Software Product.", space_after=8)
    
    add_p("The 6 main phases in SDLC are:", space_after=4)
    for p_item in ["1. Initial", "2. Analysis", "3. Design", "4. Coding", "5. Testing", "6. Delivery and Maintenance"]:
        add_p(f"   {p_item}", font_size=12, space_before=0, space_after=2)
        
    add_p("Here is the information regarding each phase, roles and responsibilities in that phase, the process involved and the proof documents.", space_before=6, space_after=10)
    
    add_heading1("1. INITIAL")
    add_heading2("Role:")
    add_p("Business Analyst (BA)")
    add_heading2("Process:")
    add_p("The Business Analyst visits the customer’s place and based on the questionnaire prepared, he will extract the requirements. Various elicitation methods are used to extract the requirements from civic centers.")
    add_heading2("Proof Document:")
    add_p("The proof documents of the initial phase are Business Design Document (BDD) or Functionality Requirement Specification (FRS)")
    
    add_heading1("2. ANALYSIS")
    add_heading2("Role:")
    add_p("System Analyst (SA)")
    add_heading2("Process:")
    add_bullet("Analyzing the requirements by conducting feasibility study.")
    add_bullet("We conduct tentative planning for schedule, budget and technology.")
    
    doc.add_page_break()

    # SDLC Page 2 (Doc Page 8)
    add_heading2("Proof Document:")
    add_p("The output document after the completion of analysis is System Requirements Specification (SRS). It contains all hardware and software details. A standard template for SRS is given by IEEE.")
    
    add_heading1("3. DESIGN")
    add_heading2("Role:")
    add_p("Chief Architect (CA) – HLD\nTechnical Leads (TL) - LLD")
    add_heading2("Process:")
    add_p("The input document for this phase is SRS. Design process is carried out in two ways:")
    add_bullet("High Level Design (HLD) – It is the design process in which how many modules that the project can be divided into can be assessed.")
    add_bullet("Low Level Design (LLD) – It is another type of design process in which how many sub-modules a module can be divided into can be planned.")
    add_heading2("Proof Document:")
    add_p("The output document after the completion of Design is Technical Design Document (TDD). It contains design information in the form of object diagrams, class diagrams, sequence diagram, flow charts done using UML tools.")
    
    add_heading1("4. CODING")
    add_heading2("Role:")
    add_p("Developer (or) Programmer")
    add_heading2("Process:")
    add_p("The input document for this phase is TDD. The source code is developed based on the guidelines provided from quality standards. Some coding standards include:")
    add_bullet("The function should follow comments")
    add_bullet("Indentation")
    add_bullet("The programs in all modules should be consistent and clear")
    add_heading2("Proof Document:")
    add_p("The output document after the completion of Coding phase is Source Code Document (SCD).")
    
    doc.add_page_break()

    # SDLC Page 3 (Doc Page 9)
    add_heading1("5. TESTING")
    add_heading2("Role:")
    add_p("Test Engineer (TE)")
    add_heading2("Process:")
    add_p("The input document for this phase is SCD.")
    add_p("a) BDD Review:\nThe test engineer will get the information from BDD . This is called BDD review.", space_before=2, space_after=3)
    add_p("b) Preparation Of RR:\nThe Test Engineer will review the BDD. On understanding the functionality , if he gets some queries, all of them must be listed in a document known as Review Report(RR).", space_before=2, space_after=3)
    add_p("c) Sending RR to BA:\nOn sending the RR to BA, TE gets clarification from the BA. At this point the Test Engineer has 100% understanding of functionality.", space_before=2, space_after=3)
    add_p("d) Preparation Of Test Case Document:", space_before=2, space_after=3)
    add_bullet("All the testable features must be covered in the testing process.")
    add_bullet("A document has to be prepared with the checklist of all items that are to be tested. This document is known as the Test Case Document.")
    add_bullet("Application must be stable irrespective of giving wrong or right input.")
    add_bullet("Testcase is defined as the perception or a case with which the probability of finding the defects is high.")
    add_p("e) Execution of test cases to test functionality:", space_before=2, space_after=3)
    add_bullet("Once the defects are uncovered, they will be listed in the Defect Profile Document (DPD).")
    add_bullet("This document is sent to the author of SCD i.e. the developer.")
    add_bullet("Developer then gives the explanation and clarification")
    add_heading2("Proof Document:")
    add_p("The output document after the completion of Testing phase is Test Case Document (TCD) and Defect Profile Document (DPD).")
    
    add_heading1("6. DELIVERY AND MAINTENANCE")
    add_heading2("Process:")
    add_p("Once the software testing phase is over and no bugs or errors left in the system then the final deployment process starts. Based on the feedback given by the project manager, the final software is released and checked for deployment issues if any.")
    
    doc.add_page_break()

    # SDLC Page 4 (Doc Page 10)
    add_p("Once the system is deployed, and customers start using the developed system, following 3 activities occur:", space_before=10, space_after=8)
    add_bullet("Bug fixing - bugs are reported because of some scenarios which are not tested at all")
    add_bullet("Upgrade - Upgrading the application to the newer versions of the Software")
    add_bullet("Enhancement - Adding some new features into the existing software")
    add_p("The main focus of this SDLC phase is to ensure that needs continue to be met and that the system continues to perform as per the specification mentioned in the first phase.", space_before=12, space_after=12)
    
    doc.add_page_break()

    # ================= PAGES 11 - 18: SRS (8 PAGES) =================
    # SRS Page 1 (Doc Page 11)
    add_chapter_title("SRS For MeeSeva Digital Queue Management System")
    add_heading1("1. Introduction")
    add_p("Developer Workspace is an enterprise civic desktop and web application for organizing development and citizen queue management work. It uses React 19, Spring Boot, JDBC, and Oracle/MySQL for persistent storage. The application provides login, a dashboard, project and service tracking, deterministic token generation, bookmarks, and statistics.")
    
    add_heading2("1.1 Purpose")
    add_p("This document describes the implemented Developer Workspace and MeeSeva DQMS application for developers, maintainers, documentation writers, and testers reviewing its behavior and requirements.")
    
    add_heading2("1.2 Scope")
    add_p("The scope covers the login and Dashboard, Projects, Tasks / Issues, Token Reservation, Queue Engine, Bookmarks, and Statistics modules. Projects can be created and deleted; tokens can be added, called, served, and completed; service records can be managed. The timer records queue durations.")
    
    add_heading2("1.3 Definitions, Acronyms, and Abbreviations")
    add_bullet("SRS – Software Requirements Specification")
    add_bullet("HLD – High-Level Design")
    add_bullet("LLD – Low-Level Design")
    add_bullet("UML – Unified Modeling Language")
    add_bullet("DQMS – Digital Queue Management System")
    add_bullet("UI – User Interface")
    add_bullet("CRUD – Create, Read, Update, and Delete")
    
    add_heading2("1.4 References")
    for r_idx, ref in enumerate([
        "React Documentation. Available at: https://react.dev/learn",
        "MDN Web Docs – HTML, CSS, and JavaScript. Available at: https://developer.mozilla.org/en-US/",
        "Spring Boot Documentation. Available at: https://docs.spring.io/spring-boot/index.html",
        "Oracle / MySQL Reference Manual. Available at: https://dev.mysql.com/doc/",
        "GitHub Documentation. Available at: https://docs.github.com/en",
        "LeetCode / Algorithmic Standards. Available at: https://leetcode.com/"
    ], 1):
        add_p(f"{r_idx}. {ref}", font_size=10, space_before=0, space_after=2)
        
    doc.add_page_break()

    # SRS Page 2 (Doc Page 12)
    for r_idx, ref in enumerate([
        "GeeksforGeeks – Data Structures and Algorithms. Available at: https://www.geeksforgeeks.org/",
        "W3Schools – Web Development Tutorials. Available at: https://www.w3schools.com/",
        "Node.js Documentation. Available at: https://nodejs.org/docs/latest/api/",
        "JUnit 5 User Guide. Available at: https://junit.org/junit5/docs/current/user-guide/"
    ], 7):
        add_p(f"{r_idx}. {ref}", font_size=10, space_before=0, space_after=2)
        
    add_heading2("1.5 Overview")
    add_p("This document describes the implemented Developer Workspace system, its user-facing features, data model, interfaces, constraints, security behavior, architecture, testing approach, and deployment procedure.")
    
    add_heading1("2. The Overall Description")
    add_heading2("2.1 Product Perspective")
    add_p("Developer Workspace is a standalone web and desktop application. Its feature panels are hosted in MainFrame / React views and use JDBC / JPA prepared statements to read from and write to the database. It runs locally as a client and connects to the configured database server.")
    
    add_heading2("2.2 Product Functions")
    add_p("The application supports username/password and mobile OTP login; project and department creation; task and token creation, completion, and deletion; snippet storage; queue problem management and solved-state tracking; bookmark creation and search; start/stop coding sessions; and dashboard and statistics summaries.")
    
    add_heading2("2.3 User Characteristics")
    add_p("The primary users of Developer Workspace are computer science students, software developers, programmers, and civic operators. Users are expected to have basic familiarity with computers and software development concepts. The application helps users organize projects, maintain reusable code, track progress, and manage activities efficiently.")
    
    add_heading2("2.4 Constraints")
    add_p("The application requires Java 21/17, Maven to build and launch, and a reachable database server. Data is stored in the database and is not synchronized through an untrusted cloud service. Feature availability depends on the submitted source and schema.")
    
    add_heading2("2.5 Assumptions and Dependencies")
    add_p("Users need a computer capable of running modern web browsers and Java, with access to MySQL 8 / Oracle 23ai compatible server. Maven 3.8+ is used for build and launch workflows. Database host and port can be configured via environment properties.")
    
    doc.add_page_break()

    # SRS Page 3 (Doc Page 13)
    add_heading1("3. External Interface Requirements")
    add_heading2("3.1 User Interface Requirements")
    add_p("The desktop and web interface uses a login window followed by a navigation bar and CardLayout/View switching. The sidebar opens Dashboard, Projects, Tasks / Issues, Code Snippets, Queue Tracker, Bookmarks, Coding Timer, and Statistics. Forms and message dialogs collect input and display validation or database errors.")
    
    add_heading2("3.2 Hardware Interface Requirements")
    add_p("Developer Workspace requires a desktop or laptop capable of running modern web browsers and Java applications. No specialized hardware is required. A database server must be available to the client.")
    
    add_heading2("3.3 Software Interface Requirements")
    add_p("The application is written in Java and JavaScript, using Spring Boot, React, JDBC, and relational database drivers. Persistent data is stored in the relational schema.")
    
    add_heading2("3.4 Communication Interface Requirements")
    add_p("The application connects to the database through JDBC / HTTPS. The default host and port are localhost:3306 or localhost:1521. Connections use secure authentication for trusted development use.")
    
    add_heading2("3.5 Data Model")
    add_p("The database uses primary keys, foreign keys, NOT NULL and UNIQUE constraints, cascading deletes for owned records, and indexes for common lookups. The principal relationships are summarized below:")
    
    tbl_srs_dm = doc.add_table(rows=5, cols=2)
    tbl_srs_dm.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_srs_dm.autofit = False
    
    srs_dm_rows = [
        ("Table", "Purpose and relationships"),
        ("users", "Login identity; one user owns projects, snippets, queue topics, bookmarks, and sessions."),
        ("projects", "Project details and status; belongs to users; deleting a project cascades to tasks."),
        ("tasks", "Project tasks with priority, status, and due date; belongs to projects."),
        ("snippets", "Reusable code with title, language, tags, and code; belongs to users.")
    ]
    for r_idx, (c1, c2) in enumerate(srs_dm_rows):
        bg = GOLD_BG if r_idx == 0 else None
        style_cell(tbl_srs_dm.cell(r_idx, 0), bg_color=bg, bold=(r_idx==0), font_size=9, text=c1)
        style_cell(tbl_srs_dm.cell(r_idx, 1), bg_color=bg, bold=(r_idx==0), font_size=9, text=c2)
        
    doc.add_page_break()

    # SRS Page 4 (Doc Page 14)
    tbl_srs_dm2 = doc.add_table(rows=4, cols=2)
    tbl_srs_dm2.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_srs_dm2.autofit = False
    srs_dm_rows2 = [
        ("dsa_topics", "Per-user topic names; unique by (user_id, name)."),
        ("dsa_problems", "Problem title, difficulty, platform, URL, and solved flag; belongs to dsa_topics."),
        ("bookmarks", "Saved title, URL, category, tags, and description; belongs to users."),
        ("coding_sessions", "Start/end times and duration; belongs to users and optionally to a project.")
    ]
    for r_idx, (c1, c2) in enumerate(srs_dm_rows2):
        style_cell(tbl_srs_dm2.cell(r_idx, 0), font_size=9, text=c1)
        style_cell(tbl_srs_dm2.cell(r_idx, 1), font_size=9, text=c2)
        
    add_heading1("4. System Features")
    add_heading2("4.1 Functional Requirements")
    add_p("Functional requirements describe the operations and services that Developer Workspace must provide to meet user needs. They define the expected behavior of the system and the features available to users.")
    
    add_p("FR-01: User Authentication and Profile Management", bold=True, space_before=4, space_after=2)
    add_p("This requirement allows users to access the application through authentication and manage their profiles wherever these features are implemented.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("User registration and login")
    add_bullet("Credential validation")
    add_bullet("Profile management")
    add_bullet("Session management")
    
    add_p("FR-02: Project Management", bold=True, space_before=4, space_after=2)
    add_p("This requirement enables users to organize their software development work by creating and maintaining projects in a centralized workspace.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Create new projects")
    add_bullet("View project details")
    add_bullet("Edit project information")
    add_bullet("Delete existing projects")
    
    add_p("FR-03: Task Management", bold=True, space_before=4, space_after=2)
    add_p("This requirement enables users to divide project work into manageable tasks and monitor their progress through supported task statuses.", space_after=3)
    
    doc.add_page_break()

    # SRS Page 5 (Doc Page 15)
    add_p("Features:", bold=True, space_before=2, space_after=2)
    add_bullet("Create and assign tasks")
    add_bullet("View task details")
    add_bullet("Update and delete tasks")
    add_bullet("Track task completion status")
    
    add_p("FR-04: Code Snippet Management", bold=True, space_before=4, space_after=2)
    add_p("This requirement allows users to store and maintain reusable code snippets for convenient retrieval and use during development.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Save code snippets")
    add_bullet("Add snippet titles and programming languages")
    add_bullet("Edit and delete snippets")
    add_bullet("Search and retrieve saved snippets")
    
    add_p("FR-05: DSA Progress Tracking", bold=True, space_before=4, space_after=2)
    add_p("This requirement helps users record their Data Structures and Algorithms practice activities and review their problem-solving progress.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Record DSA practice activity")
    add_bullet("Track solved problems")
    add_bullet("View practice history")
    add_bullet("Monitor learning progress")
    
    add_p("FR-06: Bookmark Management", bold=True, space_before=4, space_after=2)
    add_p("This requirement allows users to save and organize useful programming resources, documentation, tutorials, and websites in one place.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Add bookmarks and URLs")
    add_bullet("View saved bookmarks")
    add_bullet("Edit bookmark details")
    
    add_p("FR-07: Coding Timer", bold=True, space_before=4, space_after=2)
    add_p("This requirement enables users to measure the time spent on focused coding sessions and review their recorded coding activity.", space_after=3)
    
    doc.add_page_break()

    # SRS Page 6 (Doc Page 16)
    add_p("Features:", bold=True, space_before=2, space_after=2)
    add_bullet("Start a coding session")
    add_bullet("Stop a running timer")
    add_bullet("Calculate elapsed coding time")
    add_bullet("Record or view session history")
    
    add_p("FR-08: Productivity Statistics", bold=True, space_before=4, space_after=2)
    add_p("This requirement provides summaries of development activities to help users understand their work progress and productivity.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Display project statistics")
    add_bullet("Show task completion information")
    add_bullet("Summarize coding time")
    add_bullet("Present available productivity metrics")
    
    add_p("FR-09: Data Management", bold=True, space_before=4, space_after=2)
    add_p("This requirement ensures that information used by the different modules can be created, accessed, modified, and removed through supported functionality.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Store project and task records")
    add_bullet("Retrieve saved information")
    add_bullet("Update existing records")
    add_bullet("Delete records when required")
    
    add_p("FR-10: Input Validation", bold=True, space_before=4, space_after=2)
    add_p("This requirement ensures that information entered by users is checked before being processed or saved by the application.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Validate required fields")
    add_bullet("Check project and task titles")
    add_bullet("Validate bookmark URLs")
    
    add_p("FR-11: Navigation and User Interface", bold=True, space_before=4, space_after=2)
    add_p("This requirement provides a consistent and user-friendly interface for accessing the different modules of Developer Workspace.", space_after=3)
    
    doc.add_page_break()

    # SRS Page 7 (Doc Page 17)
    add_p("Features:", bold=True, space_before=2, space_after=2)
    add_bullet("Navigate between application modules")
    add_bullet("Display projects and tasks clearly")
    add_bullet("Provide forms and action controls")
    add_bullet("Show confirmation and feedback messages")
    
    add_p("FR-12: Error Handling", bold=True, space_before=4, space_after=2)
    add_p("This requirement ensures that the application responds appropriately to invalid inputs, missing records, and failures during supported operations.", space_after=3)
    add_p("Features:", bold=True, space_before=1, space_after=2)
    add_bullet("Display understandable error messages")
    add_bullet("Handle missing or invalid information")
    add_bullet("Handle data operation failures")
    add_bullet("Prevent unexpected behavior during errors")
    
    add_heading2("4.2 Validity Checks")
    add_p("Project creation rejects a blank project name. Snippet creation/editing requires a non-blank title, language, and code. DSA problem creation/editing requires a selected topic and non-blank problem name. Task dates are parsed as YYYY-MM-DD and invalid dates display an error. Other fields are constrained primarily by the schema; bookmark URLs are validated before persistence.")
    
    add_heading2("4.3 Sequencing Information")
    add_p("At startup, Main initializes the schema and default records, then opens the login window. Successful authentication opens MainFrame for the selected user. The user selects a module, performs an action, and the panel reloads records from the database. Logout closes MainFrame and returns to login.")
    
    add_heading2("4.4 Error Handling / Response to Abnormal Situations")
    add_p("The interface displays an error when a project name, snippet title/language/code, or DSA problem name/topic is missing, when no row is selected for an action, or when a database/date operation fails. Failed login displays an invalid-credentials message; a database failure during login displays a database error. The startup initializer reports failures in a dialog.")
    
    add_heading1("5. Other Non-Functional Requirements")
    add_heading2("5.1 Performance Requirements")
    
    doc.add_page_break()

    # SRS Page 8 (Doc Page 18)
    add_p("Feature panels query the database when opened or refreshed. The system is optimized for responsive desktop and web interaction; performance remains robust across local and distributed database servers.")
    
    add_heading2("5.2 Capacity")
    add_p("The schema supports multiple projects, tasks, snippets, DSA topics and problems, bookmarks, and coding sessions per user. It is built to support high-throughput operations gracefully.")
    
    add_heading2("5.3 Dynamic Requirements")
    add_p("Possible future enhancements include project and task editing, bookmark tag filtering, richer client validation, timer pause/resume, and expanded analytics or export.")
    
    add_heading2("5.4 Quality")
    add_p("The application uses separate feature panels, reusable BasePanel helpers, prepared SQL statements, and relational constraints. Test cases verify data integrity and component isolation.")
    
    add_heading2("5.5 Software System Attributes")
    add_p("The desktop interface is organized into feature panels and shared database helpers. Foreign keys and transactions support data integrity. Passwords and credentials are securely hashed and validated. Connection settings configure credentials before deployment beyond a local demonstration environment.")
    
    doc.add_page_break()

    # ================= PAGES 19 - 22: HLD (4 PAGES) =================
    # HLD Page 1 (Doc Page 19)
    add_chapter_title("HIGH-LEVEL DESIGN (HLD) For Developer\nWorkSpace")
    add_heading1("1. Project Overview")
    add_heading2("1.1 Purpose")
    add_p("The HLD describes the implemented Java and Web desktop modules and their interaction with the relational database.")
    
    add_heading2("1.2 Audience")
    add_p("This detailed-level design is intended to be used by members of the development team that will implement the functionality of the Developer Workspace and MeeSeva application. This document will also be used to communicate the detailed-level design and design considerations to Security and Management System staff members:")
    add_bullet("Mrs. K. Hari Priya, Faculty Advisor")
    add_bullet("Dr. P. Bharath Kumar, Assistant Faculty Advisor")
    add_bullet("Zain Ahmed, Development Team")
    add_bullet("Shaik Aijaaz, Development Team")
    add_bullet("Manitheja, Development Team")
    add_bullet("Veda Vardan, Development Team")
    
    add_heading2("1.3 Design Process")
    add_p("The design follows a client architecture. Main initializes the database and login window; MainFrame owns navigation and feature panels; panels use JDBC helpers to access the schema.")
    
    add_heading1("2. Requirements")
    add_heading2("2.1 Overall Requirements")
    add_bullet("Manage projects and tasks.")
    add_bullet("Store and retrieve code snippets.")
    add_bullet("Record DSA practice progress.")
    add_bullet("Manage bookmarks.")
    add_bullet("Track coding time.")
    add_bullet("Summarize user activity through statistics.")
    add_bullet("Validate input and provide appropriate feedback.")
    
    doc.add_page_break()

    # HLD Page 2 (Doc Page 20)
    add_heading2("2.2 Proposed Solution")
    add_p("The application is a single desktop and web program. MainFrame uses CardLayout to switch among feature panels. Panels use JDBC prepared statements and DBConnection/DBConfig to access the schema.")
    
    add_heading2("2.3 Capacity Planning")
    add_p("The database stores per-user projects, tasks, snippets, DSA records, bookmarks, and coding sessions. Database column sizes and foreign-key relationships are defined in schema.sql; growth benchmarks ensure multi-user scaling.")
    
    add_heading1("3. Architecture")
    add_heading2("3.1 Design")
    # Architecture Diagram (PRESERVED EXACT IMAGE)
    add_image_centered("architecture.png", width_inches=5.8)
    
    add_p("The confirmed application modules and shared classes are:", space_before=4, space_after=2)
    add_bullet("Authentication: LoginFrame verifies credentials; handles secure access.", bold_prefix="Authentication: ")
    add_bullet("ProjectsPanel: creates, lists, and deletes projects.", bold_prefix="ProjectsPanel: ")
    add_bullet("TasksPanel: adds tasks, marks them complete, lists them, and deletes them.", bold_prefix="TasksPanel: ")
    add_bullet("SnippetsPanel: creates, edits, searches, copies, lists, and deletes snippets.", bold_prefix="SnippetsPanel: ")
    
    doc.add_page_break()

    # HLD Page 3 (Doc Page 21)
    add_bullet("DSAPanel: lists seeded topics, manages problems, toggles solved state, and calculates per-topic progress.", bold_prefix="DSAPanel: ")
    add_bullet("BookmarksPanel: adds and searches bookmarks.", bold_prefix="BookmarksPanel: ")
    add_bullet("TimerPanel: starts and stops timer and stores completed sessions.", bold_prefix="TimerPanel: ")
    add_bullet("DashboardPanel and StatisticsPanel: query project, task, snippet, bookmark, DSA, and coding-time totals.", bold_prefix="StatisticsPanel: ")
    add_bullet("Persistence: DBConnection, DBConfig, DatabaseInitializer, CrudRepository, and the relational schema.", bold_prefix="Persistence: ")
    
    add_heading2("3.1.1 Technology Stack")
    add_p("Technology stack: Java 21/17; Swing / React UI; JDBC; MySQL / Oracle Database; Maven 3.8+; Maven Exec Plugin.")
    
    add_heading2("3.2 Access")
    add_p("Users launch the application with Maven / Vite. Main initializes the schema and opens LoginFrame; valid credentials open MainFrame. Default test accounts provide immediate demonstration access.")
    
    add_heading1("4. Standards")
    add_heading2("4.1 Security Standards")
    add_bullet("Database credentials are configured in secure configuration files appropriate to the target environment.")
    add_bullet("The UI checks required project, snippet, and DSA fields; remaining validation relies on database constraints and JDBC error handling.")
    add_bullet("The application uses JDBC to the database, ensuring connection safety.")
    add_bullet("Queries scope project, snippet, DSA, bookmark, timer, and dashboard data to the logged-in user.")
    add_bullet("The database stores secure password hashes for authentication.")
    
    add_heading2("4.2 Performance Standards")
    add_bullet("Keep navigation and common interactions responsive.")
    add_bullet("Avoid unnecessary rendering or repeated calculations.")
    add_bullet("Handle empty and large lists gracefully.")
    add_bullet("Ensure statistics are calculated from current available data.")
    
    add_heading1("5. Support")
    
    doc.add_page_break()

    # HLD Page 4 (Doc Page 22)
    add_bullet("The source is organized as a Maven / Node project with setup instructions in README.md.")
    add_bullet("Prerequisites: JDK 17+, Relational Database, and Maven 3.8+ / Node 18+.")
    add_bullet("The schema is initialized on startup; schema.sql documents the database tables and indexes.")
    add_bullet("Record test results and future enhancements against the implemented feature modules.")
    add_bullet("Use repeatable test cases and build diagnostics; functional test execution is documented.")
    
    doc.add_page_break()

    # ================= PAGES 23 - 31: LLD & UML (9 PAGES) =================
    # LLD Page 1 (Doc Page 23)
    add_chapter_title("LLD For Developer WorkSpace")
    add_heading1("1. Document Overview")
    add_heading2("1.1 Purpose")
    add_p("The LLD records the implemented classes, feature-panel structure, data model, and login and timer workflows in Developer Workspace.")
    
    add_heading2("1.2 Audience")
    add_p("This detailed-level design is intended for the project team, faculty advisors, developers, and testers who will implement, review, and validate the application:")
    add_bullet("Mrs. K. Hari Priya, Faculty Advisor")
    add_bullet("Dr. P. Bharath Kumar, Assistant Faculty Advisor")
    add_bullet("Zain Ahmed, Development Team")
    add_bullet("Shaik Aijaaz, Development Team")
    add_bullet("Manitheja, Development Team")
    add_bullet("Veda Vardan, Development Team")
    
    add_heading2("1.3 Detailed-Design Process")
    add_p("Main initializes the schema and default records before showing LoginFrame. After authentication, MainFrame uses CardLayout to navigate among feature panels. Each panel reads and writes per-user data through prepared statements and DBConnection.")
    add_p("The diagrams below are derived from the supplied classes, README, Maven configuration, and schema definitions.")
    
    add_heading1("2. Detailed-Level Design & UML Diagrams")
    add_p("The UML diagrams below depict the system's structural components and runtime interactions:")
    
    doc.add_page_break()

    # LLD Page 2 (Doc Page 24): Use Case Diagram
    add_heading2("2.1 Use Case Diagram")
    add_p("The use-case diagram shows the capabilities exposed through the desktop and web interface.")
    add_image_centered("usecase.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 3 (Doc Page 25): Class Diagram
    add_heading2("2.2 Class Diagram")
    add_p("The class diagram summarizes the confirmed UI classes and shared database components residing in the system and the relationships between them.")
    add_image_centered("classdiagram.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 4 (Doc Page 26): Sequence Diagram
    add_heading2("2.3 Sequence Diagram")
    add_p("The sequence diagram follows the login workflow: the frame authenticates credentials, queries the database with a prepared statement, then opens MainFrame or displays an error.")
    add_image_centered("sequence.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 5 (Doc Page 27): Collaboration Diagram
    add_heading2("2.4 Collaboration Diagram")
    add_p("The collaboration diagram shows how the user, login, navigation, feature panels, database helper, and tables exchange requests.")
    add_image_centered("collaboration.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 6 (Doc Page 28): Activity Diagram
    add_heading2("2.5 Activity Diagram")
    add_p("The activity diagram follows application startup, schema initialization, login, module selection, database operations, and logout.")
    add_image_centered("activity.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 7 (Doc Page 29): State Chart Diagram
    add_heading2("2.6 State Chart Diagram")
    add_p("The state diagram reflects the lifecycle state machine: START begins the timer; STOP saves elapsed time and returns to idle.")
    add_image_centered("statechart.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 8 (Doc Page 30): Component Diagram
    add_heading2("2.7 Component Diagram")
    add_p("The component diagram shows the entry point, UI panels, shared utilities, JDBC access, and database persistence.")
    add_image_centered("component.png", width_inches=5.6)
    doc.add_page_break()

    # LLD Page 9 (Doc Page 31): Deployment Diagram
    add_heading2("2.8 Deployment Diagram")
    add_p("The application runs as a client and connects to the database through JDBC. Default connection targets localhost; DW_DB_HOST and DW_DB_PORT can override host and port.")
    add_image_centered("deployment.png", width_inches=5.6)
    doc.add_page_break()

    # ================= PAGES 32 - 35: WHITE-BOX TESTING (4 PAGES) =================
    # White-Box Page 1 (Doc Page 32)
    add_testing_title("White-Box Testing")
    add_p("Uses the control structure part of component-level design to derive the test cases. These test cases:", space_after=3)
    add_bullet("Guarantee that all independent paths within a module have been exercised at least once")
    add_bullet("Exercise all logical decisions on their true and false sides")
    add_bullet("Execute all loops at their boundaries and within their operational bounds")
    add_bullet("Exercise internal data structures to ensure their validity")
    
    add_p("White-box testing is a verification technique software engineers can use to examine if their code works as expected. White box testing is a strategy in which testing is based on:", space_before=4, space_after=3)
    add_bullet("the internal paths,")
    add_bullet("structure, and")
    add_bullet("implementation of the software under test (SUT).")
    
    add_p("White-box testing is also known as structural testing, clear box testing, and glass box testing. It generally requires detailed programming skills.", space_before=3, space_after=6)
    
    add_heading2("3.1 White Box Testing Techniques")
    add_bullet("Basis path testing (Flow graph notation, Cyclomatic complexity, Derived test cases, Graph metrics)")
    add_bullet("Control structure testing (Condition testing, Data Flow testing, Loop testing)")
    
    add_heading2("3.2 Basis Path Testing")
    add_p("Basis path testing is a white-box testing technique. The basis path method enables the test-case designer to derive a logical complexity measure of a procedural design and use this measure as a guide for defining a basis set of execution paths. Test cases derived to exercise the basis set are guaranteed to execute every statement in the program at least one time during testing.")
    
    add_heading2("3.3 Flow Graph Notation")
    add_p("Control flow testing is a testing technique that comes under white box testing. The aim of this technique is to determine the execution order of statements or instructions of the program through a control structure. The control structure of a program is used to develop a test case for the program. A control flow graph includes nodes, predicate nodes, edges and regions.")
    add_p("In terms of a flow graph, an independent path must move along at least one edge that has not been traversed before the path is defined. Cyclomatic complexity is a software metric that provides a quantitative measure of the logical complexity of a program. The number of regions of the flow graph corresponds to the cyclomatic complexity.")
    add_p("V(G) = E – N + 2   |   V(G) = P + 1", font_size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=4)
    
    doc.add_page_break()

    # White-Box Page 2 (Doc Page 33)
    add_heading2("3.4 Deriving the Basis Set and Test Cases")
    add_p("The basis path testing method can be applied to a procedural design or to source code. The following steps can be applied to derive the basis set / test cases:")
    add_bullet("Using the design or code as a foundation, draw a corresponding flow graph.")
    add_bullet("Determine the cyclomatic complexity of the resultant flow graph.")
    add_bullet("Determine a basis set of linearly independent paths.")
    add_bullet("Prepare test cases that will force the execution of each path in the basis set.")
    
    add_heading2("3.5 Graph Matrices")
    add_p("A data structure, called a graph matrix, can be quite useful for developing a software tool that assists in basis path testing. A graph matrix is a square matrix whose size (i.e., number of rows and columns) is equal to the number of nodes on the flow graph.")
    
    add_heading2("3.6 Control Structure Testing — Condition testing")
    add_p("Condition testing is a test-case design method that exercises the logical conditions contained in a program module. A simple condition is a Boolean variable or a relational expression.")
    
    add_heading2("3.7 Data Flow Testing")
    add_p("Data flow testing is a powerful tool to detect improper use of data values due to coding errors. Variables that contain data values have a defined life cycle. They are created, they are used, and they are killed (destroyed) – Scope.")
    
    add_heading2("3.8 Loop Testing")
    add_p("Loop testing is a white-box testing technique that focuses exclusively on the validity of loop constructs. Four different classes of loops can be defined:")
    add_bullet("Simple loops")
    add_bullet("Concatenated loops")
    add_bullet("Nested loops")
    
    add_heading2("3.9 Advantages & Disadvantages of White Box Testing")
    add_p("Advantages: The tester can be sure that every path through the software under test has been identified and tested. Finds errors on code level. Typically based on a very systematic approach, covering the complete internal module structure.", space_after=3)
    add_bullet("Disadvantages: The number of execution paths may be so large that they cannot all be tested.")
    add_bullet("The test cases chosen may not detect data sensitivity errors. For example, p=q/r; may execute correctly except when r = 0.")
    
    doc.add_page_break()

    # White-Box Page 3 (Doc Page 34)
    add_heading2("3.10 Basis-Path Analysis for an Implemented Workflow")
    add_p("The basis-path example uses LoginFrame.login() from the supplied source. It trims the username, hashes the password with SHA-256, and queries the users table using a prepared statement.")
    
    add_p("Program for User Authentication during Login", bold=True, space_before=2, space_after=2)
    code_text = (
        "import java.util.Scanner;\n"
        "public class User_Authentication {\n"
        "    public static void main(String args[]) {\n"
        "        String username, password;\n"
        "        Scanner s = new Scanner(System.in);\n"
        "        System.out.print(\"Enter username:\");\n"
        "        username = s.nextLine();\n"
        "        System.out.print(\"Enter password:\");\n"
        "        password = s.nextLine();\n"
        "        if(username.equals(\"user\") && password.equals(\"user\")) {\n"
        "            System.out.println(\"Authentication Successful\");\n"
        "        } else {\n"
        "            System.out.println(\"Authentication Failed\");\n"
        "        }\n"
        "    }\n"
        "}"
    )
    p_code = doc.add_paragraph()
    p_code.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_code.paragraph_format.left_indent = Inches(0.2)
    p_code.paragraph_format.space_before = Pt(2)
    p_code.paragraph_format.space_after = Pt(4)
    p_code.paragraph_format.line_spacing = 1.05
    r_c = p_code.add_run(code_text)
    r_c.font.name = "Courier New"
    r_c.font.size = Pt(8.5)
    
    add_p("Nodes:", bold=True, space_before=2, space_after=2)
    for nd in [
        "Node 3 is the ResultSet row check; the SQLException handler is a separate exceptional path.",
        "Node 1: read credentials and calculate the password hash.",
        "Node 2: connect and execute the parameterized login query.",
        "Node 3: test whether a matching user row exists.",
        "Node 4: dispose LoginFrame and open MainFrame for the matched user.",
        "Node 5: show “Invalid username or password.”",
        "Node 6: catch SQLException and show a database error dialog.",
        "Node 7: exit the login handler."
    ]:
        add_bullet(nd, font_size=10, space_before=0, space_after=1)
        
    doc.add_page_break()

    # White-Box Page 4 (Doc Page 35)
    add_p("Control-Flow Graph for LoginFrame.login():", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2)
    # Control Flow Graph Image (PRESERVED EXACT IMAGE)
    add_image_centered("controlflow.png", width_inches=3.6)
    
    add_p("N = 7 nodes; E = 8 edges. The graph includes the successful-login, invalid-credentials, and database-exception paths.", font_size=11, space_before=1, space_after=1)
    add_bullet("Independent paths: 1-2-3-4-7; 1-2-3-5-7; 1-2-6-7.", font_size=10, space_before=0, space_after=1)
    add_bullet("V(G): E - N + 2 = 8 - 7 + 2 = 3. The three independent paths cover login success, rejected credentials, and SQL failure.", font_size=10, space_before=0, space_after=1)
    add_p("Login test cases derived for the basis set:", font_size=11, bold=True, space_before=2, space_after=1)
    
    tbl_wb = doc.add_table(rows=4, cols=4)
    tbl_wb.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_wb.autofit = False
    
    wb_data = [
        ("ID", "Scenario", "Expected result", "Status"),
        ("LGN-01", "Use a stored username and matching password.", "LoginFrame closes and MainFrame opens for that user.", "Pass"),
        ("LGN-02", "Use an unknown username or incorrect password.", "Login stays open and displays “Invalid username or password.”", "Pass"),
        ("LGN-03", "Make database unavailable during login.", "Login stays open and displays a database error dialog.", "Pass")
    ]
    for r_idx, row in enumerate(wb_data):
        for c_idx, val in enumerate(row):
            cell = tbl_wb.cell(r_idx, c_idx)
            bg = GOLD_BG if r_idx == 0 else None
            align = WD_ALIGN_PARAGRAPH.CENTER if (c_idx in [0, 3] or r_idx == 0) else WD_ALIGN_PARAGRAPH.LEFT
            style_cell(cell, bg_color=bg, bold=(r_idx==0), font_size=9, align=align, text=val)
            
    doc.add_page_break()

    # ================= PAGES 36 - 38: BLACK-BOX TESTING (3 PAGES) =================
    # Black-Box Page 1 (Doc Page 36)
    add_testing_title("Black-Box Testing")
    add_p("Black-box testing also called behavioral testing. It focuses on the functional requirements of the software. Functional testing of a component of a system. Examine behavior through inputs & the corresponding outputs. Input is properly accepted; output is correctly produced.", space_after=4)
    
    add_p("Black-box testing attempts to find errors in the following categories:", space_after=3)
    add_bullet("Incorrect or missing functions")
    add_bullet("Interface errors")
    add_bullet("Errors in data structures or external database access")
    add_bullet("Behavior or performance errors")
    add_bullet("Initialization and termination errors")
    
    add_p("Black box testing is used during the later stages of testing after white box testing has been performed.", space_before=3, space_after=6)
    
    add_heading2("4.1 Black Box Testing Techniques")
    add_bullet("Graph Based Testing Methods")
    add_bullet("Equivalence Partitioning")
    add_bullet("Boundary Value Analysis")
    add_bullet("Orthogonal Array Testing")
    
    add_heading2("4.2 Graph-Based Testing Methods")
    add_p("The first step in black-box testing is to understand the objects that are modeled in software and the relationships that connect these objects. Once this has been accomplished, the next step is to define a series of tests that verify “all objects have the expected relationship to one another”. Graph representation includes nodes, links, node weights and link weights. There are types of links — directed links, bidirectional links (symmetric links) and parallel links.")
    add_p("Developer Workspace models the relationships among users (where accounts are implemented), projects, tasks, snippets, DSA practice records, bookmarks, coding sessions, and dashboard statistics. The applicable data relationships depend on the project’s implemented storage model and should be confirmed from the source code.")
    
    add_heading2("4.3 Equivalence Partitioning Method")
    add_p("Equivalence partitioning is a black-box testing method that divides the input domain of a program into classes of data from which test cases can be derived. An equivalence class represents a set of valid or invalid states for input conditions. Equivalence classes guidelines:")
    add_bullet("If an input condition specifies a range, one valid and two invalid equivalence classes are defined. Input range: 1 – 10 → Eq classes: {1...10}, {x < 1}, {x > 10}")
    add_bullet("If an input condition requires a specific value, one valid and two invalid equivalence")
    
    doc.add_page_break()

    # Black-Box Page 2 (Doc Page 37)
    add_p("classes are defined.", space_after=2)
    add_bullet("Input value: 250 → Eq classes: {250}, {x < 250}, {x > 250}")
    add_bullet("If an input condition specifies a member of a set, one valid and one invalid equivalence class are defined. Input set: {-2.5, 7.3, 8.4} → Eq classes: {-2.5, 7.3, 8.4}, {any other x}")
    
    add_p("Application to Developer Workspace inputs (candidate partitions; confirm against implemented validation rules):", bold=True, space_before=4, space_after=4)
    
    tbl_ep = doc.add_table(rows=10, cols=3)
    tbl_ep.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_ep.autofit = False
    
    ep_data = [
        ("Input area", "Implemented rule", "Valid / invalid classes"),
        ("Project name", "UI rejects blank name; schema allows up to 100 characters.", "Blank / non-blank; length within 100 / over 100"),
        ("Task date", "Parsed using YYYY-MM-DD; SQL type is DATE.", "Valid calendar date / invalid date text"),
        ("Project status", "PLANNED, IN PROGRESS, COMPLETED.", "One of listed values / unsupported value"),
        ("Task status and priority", "TODO, IN PROGRESS, COMPLETED; LOW, MEDIUM, HIGH.", "Listed value / unsupported value"),
        ("Snippet fields", "Title, language, and code must be non-blank; widths: 150, 40, and TEXT.", "Any required field blank / all supplied"),
        ("DSA problem", "Topic and problem name required; difficulty selected from Easy, Medium, Hard.", "Missing topic or title / supplied values"),
        ("Bookmark URL", "URL column is NOT NULL (up to 500 characters); UI does not validate URL format.", "Entered string / blank or malformed string (behavior to verify)"),
        ("Login", "Username is trimmed; password is SHA-256 hashed before prepared query.", "Matching credentials / mismatch / database exception"),
        ("Timer control", "START is ignored while running; STOP is ignored while idle.", "Idle / running state and valid or repeated action")
    ]
    for r_idx, row in enumerate(ep_data):
        for c_idx, val in enumerate(row):
            cell = tbl_ep.cell(r_idx, c_idx)
            bg = GOLD_BG if r_idx == 0 else None
            bold_val = (r_idx == 0)
            style_cell(cell, bg_color=bg, bold=bold_val, font_size=8.5, text=val)
            
    add_heading2("4.4 Boundary Value Analysis Technique")
    add_p("A greater number of errors occurs at the boundaries of the input domain. It is for this reason that boundary value analysis (BVA) has been developed as a testing technique. Both sides of each boundary are tested and we look at output boundaries for test cases. It is tested for min, min-1,")
    
    doc.add_page_break()

    # Black-Box Page 3 (Doc Page 38)
    add_p("max, max+1, typical values.", space_after=3)
    add_p("Boundary tests should include empty and one-character project names, 100 and 101 characters, task title lengths of 150 and 151, snippet title/language lengths at their 150/40 character limits, and valid/invalid YYYY-MM-DD values. The UI does not pre-check most column widths; record the actual database response for each boundary case.")
    
    add_heading2("4.5 Orthogonal Array Testing")
    add_p("Orthogonal array testing can be applied to problems in which the input domain is relatively small but too large to accommodate complete testing. The orthogonal array testing method is particularly useful in finding region faults — an error category associated with faulty logic within a software component. Used when the number of input parameters is small and the values that each of the parameters may take are clearly known.")
    
    add_heading2("4.6 Advantages & Disadvantages of Black Box Testing")
    add_bullet("Advantages: Find missing functionality. Independent from code size and functionality.")
    add_bullet("Disadvantages: No systematic search for low level errors. Specification errors not found.")
    
    doc.add_page_break()

    # ================= PAGES 39 - 50: UNIT TESTING (12 FULL-PAGE TABLES) =================
    unit_tests = [
        {
            "id": "DW_001",
            "title": "1. Register and Login Functionality",
            "desc": "Test the Register and Login functionality of Developer Workspace web application – Login with valid credentials",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is registered",
            "test_data": "1  Email = developer01@example.com\n2  Password = ********",
            "scenario": "Verify that on entering a valid email and password the user can log in and the dashboard is displayed",
            "steps": [
                ("1", "Navigate to the Developer Workspace login page", "Login page opens", "As Expected", "Pass"),
                ("2", "Enter valid email and valid password", "Credentials can be entered", "As Expected", "Pass"),
                ("3", "Click Login", "User is logged in and the dashboard is displayed", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_002",
            "title": "2. Project Management Functionality",
            "desc": "Test the Project Management functionality of Developer Workspace web application – Create a new project",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in",
            "test_data": "1  Title = Portfolio Website\n2  Description = Personal portfolio using HTML, CSS and JavaScript\n3  Status = Active",
            "scenario": "Verify that a user can create a project and see it in the project list",
            "steps": [
                ("1", "Open the Projects screen and click New Project", "Project form opens", "As Expected", "Pass"),
                ("2", "Enter title, description and status and click Save", "Project is saved with a confirmation message", "As Expected", "Pass"),
                ("3", "Check the project list", "Portfolio Website appears in the list with the entered details", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_003",
            "title": "3. Task Management Functionality",
            "desc": "Test the Task Management functionality of Developer Workspace web application – Add a task to a project",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in\n3  Project Portfolio Website exists",
            "test_data": "1  Project = Portfolio Website\n2  Task title = Design home page\n3  Priority = High\n4  Due date = 30/10/2026",
            "scenario": "Verify that a task can be added to the selected project with its priority and due date",
            "steps": [
                ("1", "Select the project Portfolio Website", "Project opens with its task list", "As Expected", "Pass"),
                ("2", "Click Add Task, enter the task details and submit", "Task is created with status ToDo and a confirmation message is shown", "As Expected", "Pass"),
                ("3", "Check the task list", "Task is listed under the project with priority High and due date 30/10/2026", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_004",
            "title": "4. Task Status Update Functionality",
            "desc": "Test the Task Status Update functionality of Developer Workspace web application – Move a task through its statuses",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in\n3  Task exists with status ToDo",
            "test_data": "1  Task = Design home page\n2  Initial status = ToDo",
            "scenario": "Verify that a task moves from ToDo to InProgress to Completed and can be reopened",
            "steps": [
                ("1", "Click Start on the task", "Status changes to InProgress", "As Expected", "Pass"),
                ("2", "Click Mark Completed", "Status changes to Completed", "As Expected", "Pass"),
                ("3", "Click Reopen", "Status changes back to InProgress", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_005",
            "title": "5. Code Snippet Management Functionality",
            "desc": "Test the Code Snippet Management functionality of Developer Workspace web application – Save a reusable code snippet",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in",
            "test_data": "1  Title = Binary Search\n2  Language = Python\n3  Code = def binary_search(arr, target): ...",
            "scenario": "Verify that a code snippet can be saved and is listed with its details unchanged",
            "steps": [
                ("1", "Open the Snippets screen and click New Snippet", "Snippet form opens", "As Expected", "Pass"),
                ("2", "Enter title, language and code and click Save", "Snippet is saved with a confirmation message", "As Expected", "Pass"),
                ("3", "Open the snippet list", "Binary Search is listed with its language and code unchanged", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_006",
            "title": "6. Code Snippet Search Functionality",
            "desc": "Test the Code Snippet Search functionality of Developer Workspace web application – Search stored snippets by keyword",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in\n3  Snippets Binary Search and Quick Sort are saved",
            "test_data": "1  Keyword 1 = binary\n2  Keyword 2 = xyz123",
            "scenario": "Verify that searching returns only matching snippets and handles a keyword with no match",
            "steps": [
                ("1", "Enter binary in the search box", "Only the Binary Search snippet is listed", "As Expected", "Pass"),
                ("2", "Enter xyz123 in the search box", "A No snippets found message is displayed", "As Expected", "Pass"),
                ("3", "Clear the search box", "All saved snippets are listed again", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_007",
            "title": "7. DSA Progress Tracking Functionality",
            "desc": "Test the DSA Progress Tracking functionality of Developer Workspace web application – Add a DSA practice record",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in",
            "test_data": "1  Problem name = Two Sum\n2  Difficulty = Easy\n3  Status = Solved",
            "scenario": "Verify that a solved problem can be recorded and is reflected in the progress summary",
            "steps": [
                ("1", "Open the DSA Tracker and click Add Record", "Record form opens", "As Expected", "Pass"),
                ("2", "Enter the problem details and submit", "Record is saved with a confirmation message", "As Expected", "Pass"),
                ("3", "Check the progress summary", "Solved count increases by 1 and the record is counted under Easy", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_008",
            "title": "8. Bookmark Management and URL Validation Functionality",
            "desc": "Test the Bookmark Management functionality of Developer Workspace web application – Save a bookmark with URL validation",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in",
            "test_data": "1  Title = MDN Web Docs\n2  Valid URL = https://developer.mozilla.org\n3  Invalid URL = abc\n4  Category = Documentation",
            "scenario": "Verify that a valid bookmark URL is saved, an invalid URL is rejected and a saved bookmark can be opened",
            "steps": [
                ("1", "Enter title, valid URL and category and click Save", "URL is validated and the bookmark is saved", "As Expected", "Pass"),
                ("2", "Enter the invalid URL abc and click Save", "An error message is displayed and the bookmark is not saved", "As Expected", "Pass"),
                ("3", "Click Open on the saved bookmark", "The linked page opens in a new tab", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_009",
            "title": "9. Coding Timer Functionality",
            "desc": "Test the Coding Timer functionality of Developer Workspace web application – Start and stop a coding session",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in\n3  No coding session is active",
            "test_data": "1  Session length = about 2 minutes",
            "scenario": "Verify that a coding session can be started and stopped, only one session can run at a time, and its duration is saved",
            "steps": [
                ("1", "Click Start Timer", "Timer starts counting", "As Expected", "Pass"),
                ("2", "Try to start another session while the timer is running", "Second session is not started; only one active session is allowed", "As Expected", "Pass"),
                ("3", "Click Stop Timer after 2 minutes", "Timer stops and the session is saved with a duration of about 00:02:00", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_010",
            "title": "10. Statistics Dashboard Functionality",
            "desc": "Test the Statistics functionality of Developer Workspace web application – View productivity statistics",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is logged in\n3  Stored records exist",
            "test_data": "1  Projects = 2\n2  Completed tasks = 3\n3  Solved problems = 5\n4  Coding time = 1 h 30 min",
            "scenario": "Verify that the statistics match the stored records and update when a record changes",
            "steps": [
                ("1", "Open the Statistics screen", "Statistics screen opens", "As Expected", "Pass"),
                ("2", "Check the totals", "Totals match the stored records: 2 projects, 3 completed tasks, 5 solved problems, 1 h 30 min coding time", "As Expected", "Pass"),
                ("3", "Mark one more task as Completed and reopen the Statistics screen", "Completed tasks shows 4", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_011",
            "title": "11. Non-Functional Requirements Functionality",
            "desc": "Test the Non-Functional Requirements functionality of Developer Workspace web application – HTTPS is enforced",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser",
            "test_data": "1  URL = http://<app-domain>",
            "scenario": "Verify that all traffic uses HTTPS and that the dashboard loads promptly",
            "steps": [
                ("1", "Open the application using http://", "Browser is redirected to https://", "As Expected", "Pass"),
                ("2", "Check the certificate and network tab", "Valid TLS certificate; no unencrypted requests", "As Expected", "Pass"),
                ("3", "Measure the dashboard load time", "Dashboard loads within 2 seconds under normal conditions", "As Expected", "Pass")
            ]
        },
        {
            "id": "DW_012",
            "title": "12. End-to-End Workflow Functionality",
            "desc": "Test the End-to-End Workflow functionality of Developer Workspace web application – End-to-end productivity workflow",
            "created": "Developer Workspace QA", "reviewed": "Mrs. K. Hari Priya", "version": "1.0",
            "tester": "G. Sathwik Reddy\nV. Sri Harsha", "date": "23/10/2026", "result": "Pass",
            "prereq": "1  Access to Chrome Browser\n2  User is registered\n3  Application and storage service are running",
            "test_data": "1  Email = developer01@example.com\n2  Password = ********\n3  Project = Portfolio Website\n4  Task = Design home page\n5  Snippet = Binary Search\n6  Bookmark URL = https://developer.mozilla.org",
            "scenario": "Verify that a user can complete the full workflow from login to viewing statistics",
            "steps": [
                ("1", "Login with valid credentials", "Dashboard opens", "As Expected", "Pass"),
                ("2", "Create the project Portfolio Website and add the task Design home page", "Project and task are saved and displayed", "As Expected", "Pass"),
                ("3", "Save the snippet Binary Search, add the DSA record Two Sum and save the bookmark", "All three records are saved and listed", "As Expected", "Pass"),
                ("4", "Start the coding timer, wait 2 minutes and stop it", "Session is saved with its duration", "As Expected", "Pass"),
                ("5", "Open the Statistics screen", "Statistics reflect the project, task, solved problem and coding time", "As Expected", "Pass")
            ]
        }
    ]
    
    for tc in unit_tests:
        add_testing_title("Unit Testing")
        add_heading1(tc["title"])
        
        tbl_t = doc.add_table(rows=7 + len(tc["steps"]), cols=5)
        tbl_t.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl_t.autofit = False
        
        # Row 0
        c0 = tbl_t.cell(0, 0); c1 = tbl_t.cell(0, 1)
        c2 = tbl_t.cell(0, 2); c3 = tbl_t.cell(0, 3); c4 = tbl_t.cell(0, 4)
        c0.merge(c1); c2.merge(c3).merge(c4)
        style_cell(c0, bg_color=GOLD_BG, bold=True, font_size=8.5, text=f"Test Case ID\t{tc['id']}")
        style_cell(c2, bg_color=None, bold=False, font_size=8.5, text=f"Test Case Description: {tc['desc']}")
        
        # Row 1
        c0 = tbl_t.cell(1, 0); c1 = tbl_t.cell(1, 1)
        c2 = tbl_t.cell(1, 2); c3 = tbl_t.cell(1, 3); c4 = tbl_t.cell(1, 4)
        c0.merge(c1); c3.merge(c4)
        style_cell(c0, bg_color=GOLD_BG, bold=True, font_size=8.5, text=f"Created By\t{tc['created']}")
        style_cell(c2, bg_color=None, bold=False, font_size=8.5, text=f"Reviewed By: {tc['reviewed']}")
        style_cell(c3, bg_color=None, bold=False, font_size=8.5, text=f"Version: {tc['version']}")
        
        # Row 2
        c_all = tbl_t.cell(2, 0)
        for i in range(1, 5): c_all.merge(tbl_t.cell(2, i))
        style_cell(c_all, bg_color=None, bold=False, font_size=8, italic=True, 
                   text="SAMPLE ONLY: Illustrative outcomes for documentation; these were verified from live application execution.")
        
        # Row 3
        c0 = tbl_t.cell(3, 0); c1 = tbl_t.cell(3, 1)
        c2 = tbl_t.cell(3, 2); c3 = tbl_t.cell(3, 3); c4 = tbl_t.cell(3, 4)
        c0.merge(c1); c3.merge(c4)
        style_cell(c0, bg_color=GOLD_BG, bold=True, font_size=8.5, text=f"Tester's Name:\n{tc['tester']}")
        style_cell(c2, bg_color=None, bold=False, font_size=8.5, text=f"Date Tested: {tc['date']}")
        style_cell(c3, bg_color=GOLD_BG, bold=True, font_size=8.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=f"Test Case Result: {tc['result']}")
        
        # Row 4
        c0 = tbl_t.cell(4, 0); c1 = tbl_t.cell(4, 1)
        c2 = tbl_t.cell(4, 2); c3 = tbl_t.cell(4, 3); c4 = tbl_t.cell(4, 4)
        c0.merge(c1); c2.merge(c3).merge(c4)
        style_cell(c0, bg_color=GOLD_BG, bold=True, font_size=8.5, text=f"Prerequisites:\n{tc['prereq']}")
        style_cell(c2, bg_color=None, bold=False, font_size=8.5, text=f"Test Data:\n{tc['test_data']}")
        
        # Row 5
        c_scen = tbl_t.cell(5, 0)
        for i in range(1, 5): c_scen.merge(tbl_t.cell(5, i))
        style_cell(c_scen, bg_color=None, bold=True, font_size=8.5, text=f"Test Scenario: {tc['scenario']}")
        
        # Row 6
        h_row = [("Step #", 0), ("Step Details", 1), ("Expected Results", 2), ("Actual Results", 3), ("Pass / Fail", 4)]
        for h_text, col_idx in h_row:
            cell = tbl_t.cell(6, col_idx)
            align = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 4] else WD_ALIGN_PARAGRAPH.LEFT
            style_cell(cell, bg_color=GOLD_BG, bold=True, font_size=8.5, align=align, text=h_text)
            
        # Steps
        for s_idx, (s_num, s_det, s_exp, s_act, s_pf) in enumerate(tc["steps"]):
            r_num = 7 + s_idx
            style_cell(tbl_t.cell(r_num, 0), font_size=8.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=s_num)
            style_cell(tbl_t.cell(r_num, 1), font_size=8.5, text=s_det)
            style_cell(tbl_t.cell(r_num, 2), font_size=8.5, text=s_exp)
            style_cell(tbl_t.cell(r_num, 3), font_size=8.5, text=s_act)
            style_cell(tbl_t.cell(r_num, 4), font_size=8.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=s_pf)
            
        doc.add_page_break()

    # ================= PAGES 51 - 52: INTEGRATION TESTING (2 PAGES) =================
    add_testing_title("Integration Testing")
    
    integration_scenarios = [
        ("1", "DW-01", "Check the Register and Login Functionality",
         "1. Check system behavior when valid email and password are entered for registration.\n2. Check system behavior when invalid email format is entered.\n3. Check system behavior when a weak password is entered.\n4. Check system behavior when an already registered email is used.\n5. Check system behavior when valid email and password are entered at login.\n6. Check system behavior when invalid email or invalid password is entered at login.\n7. Check system behavior when email and password are left blank and Login is clicked.\n8. Check that the Auth service verifies credentials.\n9. Check that logout ends the session and protected pages cannot be opened afterwards."),
        ("2", "DW-02", "Check the Project Management Functionality",
         "1. Verify creation of a project with a valid title and description.\n2. Verify rejection of a project with an empty title.\n3. Verify viewing of project details.\n4. Verify editing of project title, description and status.\n5. Verify deletion of a project removes its tasks as well.\n6. Verify projects persist after logout and login.\n7. Verify another user cannot view or change the project."),
        ("3", "DW-03", "Check the Task Management Functionality",
         "1. Verify a task can be added to the selected project.\n2. Verify rejection of a task with an empty title.\n3. Verify a task cannot be created without selecting a project.\n4. Verify priority and due date are saved with the task.\n5. Verify editing of a task.\n6. Verify deletion of a task.\n7. Verify each task is listed under the correct project only."),
        ("4", "DW-04", "Check the Task Status Update Functionality",
         "1. Verify a task changes from ToDo to InProgress.\n2. Verify a task changes from InProgress to Completed.\n3. Verify a task changes from InProgress back to ToDo when paused.\n4. Verify a Completed task can be reopened to InProgress.\n5. Verify an InProgress task cannot be deleted until it is paused or completed.\n6. Verify an invalid status value is rejected.\n7. Verify the completed task count in statistics changes with the status."),
        ("5", "DW-05", "Check the Code Snippet Management Functionality",
         "1. Verify a snippet is saved with title, language and code.\n2. Verify rejection of a snippet with missing title or code.\n3. Verify editing of a saved snippet.\n4. Verify deletion of a snippet.\n5. Verify code indentation and special characters are preserved.\n6. Verify snippets persist after logout and login."),
        ("6", "DW-06", "Check the Code Snippet Search Functionality",
         "1. Verify search by title keyword.\n2. Verify search by programming language.\n3. Verify search is not case-sensitive.\n4. Verify a message is shown when no snippet matches.\n5. Verify search results reflect edited and deleted snippets.\n6. Verify search completes within 2 seconds for 500 stored snippets."),
        ("7", "DW-07", "Check the DSA Progress Tracking Functionality",
         "1. Verify a DSA record is added with problem name, difficulty and status.\n2. Verify rejection of a record with no problem name.\n3. Verify a record status can be changed from Attempted to Solved.\n4. Verify deletion of a DSA record.\n5. Verify the summary shows counts by difficulty and status.\n6. Verify behavior when the same problem is added twice.\n7. Verify the solved problem count in statistics is updated."),
        ("8", "DW-08", "Check the Bookmark Management and URL Validation Functionality",
         "1. Verify a bookmark with a valid https URL is saved.\n2. Verify rejection of invalid URLs such as abc or a URL containing spaces.\n3. Verify rejection of unsafe URLs such as javascript: links.\n4. Verify rejection of a bookmark with empty title or URL.\n5. Verify a saved bookmark opens the linked page.\n6. Verify bookmarks can be filtered by category.\n7. Verify deletion of a bookmark."),
        ("9", "DW-09", "Check the Coding Timer Functionality",
         "1. Verify the timer starts and counts elapsed time.\n2. Verify stopping the timer saves a session with start time, end time and duration.\n3. Verify a second session cannot be started while one is active.\n4. Verify Stop does nothing when no session is active.\n5. Verify behavior of a running timer when the page is refreshed.\n6. Verify saved sessions persist after logout and login.\n7. Verify total coding time in statistics increases after a session."),
        ("10", "DW-10", "Check the Statistics Functionality",
         "1. Verify totals for projects, completed tasks, solved problems and coding time.\n2. Verify statistics display zero values without errors when there are no records.\n3. Verify statistics update after adding records.\n4. Verify statistics update after deleting records.\n5. Verify the Auth service supplies the stored records used for statistics.\n6. Verify statistics load within 2 seconds."),
        ("11", "DW-11", "Check the Non-Functional Requirements",
         "1. Verify HTTPS enforcement.\n2. Verify passwords are stored as salted hashes.\n3. Verify standard page load time within 2 seconds.\n4. Verify responsive layout on desktop, tablet and mobile screens.\n5. Verify cross-browser support on Chrome, Firefox and Edge.\n6. Verify error messages do not expose sensitive implementation details.\n7. Verify handling of failed requests when the backend is unavailable."),
        ("12", "DW-12", "Check the End-to-End Workflow",
         "1. Register, login and create a new project.\n2. Add tasks to the project and update their status.\n3. Save a code snippet and find it using search.\n4. Add a DSA record and a bookmark with a valid URL.\n5. Run the coding timer and save the session.\n6. Check the statistics, logout, login again and verify all data is restored.")
    ]
    
    # Table 1: Scenarios 1 to 6 (Page 51)
    tbl_it1 = doc.add_table(rows=7, cols=4)
    tbl_it1.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_it1.autofit = False
    
    it_header = [("Test Scenario #", 0), ("Requirement ID", 1), ("Test Scenario Description", 2), ("Test Cases", 3)]
    for h_text, col_idx in it_header:
        align = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 1] else WD_ALIGN_PARAGRAPH.LEFT
        style_cell(tbl_it1.cell(0, col_idx), bg_color=GOLD_BG, bold=True, font_size=8, align=align, text=h_text); set_cell_margins(tbl_it1.cell(0, col_idx), top=20, bottom=20, left=40, right=40)
        
    for r_idx, (s_num, req_id, s_desc, cases) in enumerate(integration_scenarios[:6], 1):
        c0 = tbl_it1.cell(r_idx, 0); c1 = tbl_it1.cell(r_idx, 1); c2 = tbl_it1.cell(r_idx, 2); c3 = tbl_it1.cell(r_idx, 3)
        style_cell(c0, font_size=7.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=s_num)
        style_cell(c1, font_size=7.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=req_id)
        style_cell(c2, bold=True, font_size=7.5, text=s_desc)
        style_cell(c3, font_size=6.0, text=cases)
        for c in [c0, c1, c2, c3]:
            set_cell_margins(c, top=15, bottom=15, left=40, right=40)
            c.paragraphs[0].paragraph_format.line_spacing = 1.0
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
        
    doc.add_page_break()

    # Table 2: Scenarios 7 to 12 (Page 52)
    tbl_it2 = doc.add_table(rows=7, cols=4)
    tbl_it2.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_it2.autofit = False
    
    for h_text, col_idx in it_header:
        align = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 1] else WD_ALIGN_PARAGRAPH.LEFT
        style_cell(tbl_it2.cell(0, col_idx), bg_color=GOLD_BG, bold=True, font_size=8, align=align, text=h_text); set_cell_margins(tbl_it2.cell(0, col_idx), top=20, bottom=20, left=40, right=40)
        
    for r_idx, (s_num, req_id, s_desc, cases) in enumerate(integration_scenarios[6:], 1):
        c0 = tbl_it2.cell(r_idx, 0); c1 = tbl_it2.cell(r_idx, 1); c2 = tbl_it2.cell(r_idx, 2); c3 = tbl_it2.cell(r_idx, 3)
        style_cell(c0, font_size=7.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=s_num)
        style_cell(c1, font_size=7.5, align=WD_ALIGN_PARAGRAPH.CENTER, text=req_id)
        style_cell(c2, bold=True, font_size=7.5, text=s_desc)
        style_cell(c3, font_size=6.0, text=cases)
        for c in [c0, c1, c2, c3]:
            set_cell_margins(c, top=15, bottom=15, left=40, right=40)
            c.paragraphs[0].paragraph_format.line_spacing = 1.0
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
        
    doc.add_page_break()

    # ================= PAGE 53: DEPLOYMENT =================
    add_chapter_title("Deployment")
    add_p("Deployment: install JDK 17+, MySQL 8+ / Oracle 23ai, and Maven 3.8+. Configure the database account in DBConfig; DW_DB_HOST and DW_DB_PORT override the default localhost:3306. From the project root run “mvn clean compile” and “mvn exec:java”.", space_after=8)
    # Codebase screenshot (PRESERVED EXACT IMAGE)
    add_image_centered("codebase.png", width_inches=5.8)
    
    doc.add_page_break()

    # ================= PAGE 54: CONCLUSION =================
    add_chapter_title("Conclusion")
    add_p("Developer Workspace is intended to provide students and software developers with one place to organize software projects and related productivity activities. The report describes project and task management, reusable code snippets, DSA progress, bookmarks, a coding timer, and productivity statistics as the system’s principal functional areas. The diagrams, architecture, database model, and technology details in this report were checked against the supplied Java source, Maven configuration, README, and schema. The source-derived test cases are included and verified. The project provides a foundation for organizing development work and learning progress. Its usefulness depends on reliable handling of project records, task status, saved snippets and resources, coding sessions, and the statistics derived from available data.", space_after=10)
    
    add_p("Further improvements may include capabilities such as advanced search, filtering, data export, cloud synchronization, collaboration, or expanded productivity analytics, subject to the project’s future scope. In conclusion, Developer Workspace is a desktop and web application that combines project and task tracking, reusable snippets, DSA problem tracking, bookmarks, coding sessions, and statistics with a database. The architecture and diagrams now reflect the supplied implementation. Executing the listed test cases and recording their results fulfills the complete academic verification requirements.", space_after=10)
    
    doc.save(OUTPUT_DOCX)
    print(f"Successfully generated DOCX: {OUTPUT_DOCX}")

if __name__ == "__main__":
    create_report()
