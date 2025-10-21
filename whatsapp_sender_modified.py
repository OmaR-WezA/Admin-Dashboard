import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageTk
import pandas as pd
import time
import os
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
import threading
import webbrowser
import firebase_admin
from firebase_admin import credentials, db
import uuid
import socket

CHROMEDRIVER_PATH = r"C:/chromedriver-win64/chromedriver.exe"
WHATSAPP_WEB_URL = "https://web.whatsapp.com/"
TEMPLATE_FILENAME = "whatsapp_template.xlsx"

# Initialize Firebase
try:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://your-project.firebaseio.com'
    })
except:
    print("Firebase not configured. Admin dashboard features disabled.")

DEVICE_ID = str(uuid.uuid4())
DEVICE_NAME = socket.gethostname()

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

def report_to_firebase(status, messages_sent=0, messages_failed=0):
    """Report device status and statistics to Firebase"""
    try:
        device_ref = db.reference(f'devices/{DEVICE_ID}')
        device_ref.update({
            'deviceName': DEVICE_NAME,
            'isActive': status,
            'messagesSent': messages_sent,
            'messagesFailed': messages_failed,
            'lastActive': time.time(),
            'appVersion': '1.0.0'
        })
    except Exception as e:
        print(f"Error reporting to Firebase: {e}")

class WhatsAppSenderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("WhatsApp Sender GUI")
        self.root.geometry("850x730")
        self.root.resizable(False, False)
        self.root.configure(bg="#eef2f7")

        if not self.show_rights_dialog():
            self.root.destroy()
            return

        self.add_logo()

        messagebox.showinfo(
            "📦 فك الضغط عن chromedriver",
            "❗ هام جدًا:\n\nملف chromedriver-win64.zip يرجى فك الضغط عنه\nووضع المجلد الناتج في المسار التالي:\n\nC:/chromedriver-win64\n\nبدون هذه الخطوة لن يعمل البرنامج بشكل صحيح!"
        )

        self.file_path = None
        self.df = None
        self.use_custom_message = tk.BooleanVar(value=False)
        self.sleep_time = tk.DoubleVar(value=3.0)
        self.paused = False
        self.total_sent = 0
        self.total_failed = 0

        report_to_firebase(True)

        self.build_gui()

    def show_rights_dialog(self):
        dlg = tk.Toplevel(self.root)
        dlg.title("© 2025 Weza Production — CopyRights")
        dlg.geometry("600x360")
        dlg.resizable(False, False)
        dlg.transient(self.root)
        dlg.grab_set()

        text = (
            "© 2025 Omar Mohamed Fahem\n\n"
            "يرجى قراءة الشروط التالية قبل استخدام هذا البرنامج:\n\n"
            "1. يمنع إعادة التوزيع أو النسخ أو التعديل بدون إذن صريح من صاحب البرنامج.\n"
            "2. لا يتحمل صاحب البرنامج أي مسؤولية عن الحظر أو الإشكاليات الناتجة عن استخدام التطبيق.\n"
            "3. باستخدامك هذا البرنامج، أنت توافق على الشروط أعلاه.\n\n"
            "اضغط 'Accept' للمتابعة أو 'Decline' للخروج."
        )

        lbl = tk.Label(dlg, text=text, justify="left", wraplength=560, padx=12, pady=12)
        lbl.pack(fill="both", expand=True)

        btn_frame = tk.Frame(dlg)
        btn_frame.pack(pady=8)

        def accept():
            dlg.grab_release()
            dlg.destroy()
            self._rights_accepted = True

        def decline():
            dlg.grab_release()
            dlg.destroy()
            self._rights_accepted = False

        accept_btn = tk.Button(btn_frame, text="Accept", width=12, command=accept)
        accept_btn.pack(side="left", padx=8)
        decline_btn = tk.Button(btn_frame, text="Decline", width=12, command=decline)
        decline_btn.pack(side="left", padx=8)

        self._rights_accepted = False
        self.root.wait_window(dlg)
        return getattr(self, "_rights_accepted", False)

    def add_logo(self):
        try:
            image_path = resource_path("weza_logo.png")
            image = Image.open(image_path)
            image = image.resize((80, 80), Image.LANCZOS)
            self.logo_img = ImageTk.PhotoImage(image)
            logo_label = ttk.Label(self.root, image=self.logo_img, background="#eef2f7")
            logo_label.pack(pady=(10, 0))
        except Exception as e:
            print("Error loading logo:", e)

    def build_gui(self):
        ttk.Label(self.root, text="📤 إرسال رسائل WhatsApp تلقائيًا", font=("Arial", 18, "bold"), background="#eef2f7").pack(pady=10)
        ttk.Button(self.root, text="ℹ️ تعليمات + توافق المتصفح", command=self.show_help).pack(pady=5)

        import_frame = ttk.LabelFrame(self.root, text="📁 استيراد ملف Excel")
        import_frame.pack(padx=10, pady=10, fill="x")

        ttk.Button(import_frame, text="📥 تحميل نموذج Excel", command=self.download_template).pack(side="left", padx=10, pady=10)
        ttk.Button(import_frame, text="📂 اختيار ملف", command=self.import_excel).pack(side="left", padx=10)

        settings_frame = ttk.LabelFrame(self.root, text="⚙️ إعدادات الرسائل")
        settings_frame.pack(padx=10, pady=5, fill="x")

        ttk.Checkbutton(settings_frame, text="✅ استخدم رسالة موحدة", variable=self.use_custom_message, command=self.toggle_message_entry).pack(anchor="w", padx=10)
        self.message_entry = tk.Text(settings_frame, height=4, width=60, state="disabled")
        self.message_entry.pack(padx=10, pady=5)

        time_frame = ttk.Frame(settings_frame)
        time_frame.pack(padx=10, pady=5, anchor="w")
        ttk.Label(time_frame, text="⏱️ المدة بين الرسائل (بالثواني):").pack(side="left")
        ttk.Entry(time_frame, textvariable=self.sleep_time, width=5).pack(side="left", padx=5)

        self.table_frame = ttk.LabelFrame(self.root, text="📊 البيانات المستوردة")
        self.table_frame.pack(fill="both", expand=False, padx=10, pady=10)

        self.tree = ttk.Treeview(self.table_frame, show='headings', height=6)
        self.tree.pack(side='left', fill='both', expand=True)
        self.scrollbar = ttk.Scrollbar(self.table_frame, orient="vertical", command=self.tree.yview)
        self.scrollbar.pack(side='right', fill='y')
        self.tree.configure(yscrollcommand=self.scrollbar.set)

        ttk.Button(self.root, text="🚀 بدء الإرسال", command=self.confirm_start).pack(pady=5)
        self.pause_button = ttk.Button(self.root, text="⏸️ إيقاف مؤقت", command=self.toggle_pause)
        ttk.Button(self.root, text="❌ إيقاف البرنامج", command=self.on_closing).pack(pady=5)

        self.status_label = ttk.Label(self.root, text="", background="#eef2f7", foreground="green")
        self.status_label.pack()

        ttk.Label(
            self.root,
            text="© 2025 Weza Production - جميع الحقوق محفوظة",
            font=("Arial", 9),
            background="#eef2f7",
            foreground="#555"
        ).pack(side="bottom", pady=8)

        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

    def on_closing(self):
        """Report device as inactive when closing"""
        report_to_firebase(False, self.total_sent, self.total_failed)
        self.root.destroy()

    def download_template(self):
        df = pd.DataFrame({
            "Phone": ["201234567890", "201098765432"],
            "Message": ["رسالة 1", "رسالة 2"]
        })
        df.to_excel(TEMPLATE_FILENAME, index=False)
        messagebox.showinfo("✅ تم", f"تم حفظ النموذج باسم {TEMPLATE_FILENAME}")

    def show_help(self):
        help_text = (
            "📌 خطوات الاستخدام:\n"
            "1. اضغط على 'تحميل نموذج Excel' وعدّل عليه.\n"
            "2. اختر الملف باستخدام 'اختيار ملف'.\n"
            "3. اختر إذا كنت ستستخدم رسالة موحدة أو رسائل فردية.\n"
            "4. حدد وقت بين الرسائل لتفادي الحظر.\n"
            "5. اضغط 'بدء الإرسال'.\n"
            "6. يمكنك الإيقاف المؤقت والاستئناف في أي وقت.\n\n"
            "⚠️ البرنامج غير مسئول عن الحظر من واتساب.\n\n"
            "=== توافق المتصفح ===\n"
            "✔️ يجب أن يكون إصدار ChromeDriver متوافقًا مع إصدار Google Chrome.\n"
            "🔗 https://chromedriver.chromium.org/downloads"
        )
        messagebox.showinfo("📘 تعليمات", help_text)

    def import_excel(self):
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if not file_path:
            return
        try:
            df = pd.read_excel(file_path)
            if "Phone" not in df.columns:
                messagebox.showerror("❌ خطأ", "الملف يجب أن يحتوي على عمود 'Phone'")
                return
            self.df = df
            self.file_path = file_path
            self.display_table_data()
            messagebox.showinfo("✅ تم", "تم استيراد الملف بنجاح.")
        except Exception as e:
            messagebox.showerror("❌ خطأ", f"فشل في قراءة الملف: {e}")

    def display_table_data(self):
        self.tree.delete(*self.tree.get_children())
        self.tree["columns"] = list(self.df.columns)
        for col in self.df.columns:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150, anchor="center")
        for _, row in self.df.iterrows():
            values = [row[col] for col in self.df.columns]
            self.tree.insert("", "end", values=values)

    def toggle_message_entry(self):
        if self.use_custom_message.get():
            self.message_entry.config(state="normal")
        else:
            self.message_entry.delete("1.0", tk.END)
            self.message_entry.config(state="disabled")

    def toggle_pause(self):
        self.paused = not self.paused
        if self.paused:
            self.pause_button.config(text="▶️ استئناف")
            self.status_label.config(text="⏸️ متوقف مؤقتًا", foreground="orange")
        else:
            self.pause_button.config(text="⏸️ إيقاف مؤقت")
            self.status_label.config(text="✅ مستأنف", foreground="green")
        self.root.update()

    def confirm_start(self):
        if not self.df_is_valid():
            return
        confirm = messagebox.askyesno("⚠️ تحذير", "البرنامج غير مسئول عن الحظر. هل ترغب بالمتابعة؟")
        if confirm:
            self.start_sending()

    def df_is_valid(self):
        if self.df is None:
            messagebox.showwarning("⚠️ تنبيه", "يرجى استيراد ملف Excel أولًا.")
            return False
        if self.use_custom_message.get():
            msg = self.message_entry.get("1.0", tk.END).strip()
            if not msg:
                messagebox.showwarning("⚠️ تنبيه", "أدخل الرسالة الموحدة أو ألغِ التحديد.")
                return False
        else:
            if "Message" not in self.df.columns:
                messagebox.showerror("❌ خطأ", "الملف يجب أن يحتوي على عمود 'Message'.")
                return False
        try:
            float(self.sleep_time.get())
        except ValueError:
            messagebox.showerror("❌ خطأ", "أدخل رقمًا صحيحًا لمدة التوقف.")
            return False
        return True

    def start_sending(self):
        thread = threading.Thread(target=self._send_messages_thread)
        thread.start()

    def _send_messages_thread(self):
        try:
            progress_win = tk.Toplevel(self.root)
            progress_win.title("📦 Progress")
            progress_win.geometry("500x400")
            progress_win.resizable(False, False)
            progress_win.attributes('-topmost', True)
            progress_win.configure(bg="#eef2f7")

            ttk.Label(progress_win, text="🚀 Sending Messages...", font=("Arial", 14, "bold"), background="#eef2f7").pack(pady=10)
            self.progress_label = ttk.Label(progress_win, text="", background="#eef2f7", foreground="green")
            self.progress_label.pack(pady=5)
            self.progress_bar = ttk.Progressbar(progress_win, orient="horizontal", length=400, mode="determinate")
            self.progress_bar.pack(pady=10)
            pause_btn = ttk.Button(progress_win, text="⏸️ Pause", command=self.toggle_pause)
            pause_btn.pack(pady=5)

            self.status_label.config(text="🚀 جاري فتح المتصفح...", foreground="blue")
            self.root.update()

            service = Service(CHROMEDRIVER_PATH)
            driver = webdriver.Chrome(service=service)
            driver.get(WHATSAPP_WEB_URL)
            messagebox.showinfo("🔐 تسجيل الدخول", "سجل دخولك على واتساب ويب وانتظر لحظات حتي يفتح واضغط موافق.")
            time.sleep(10)

            total_sent = 0
            failed_data = []
            self.progress_bar["maximum"] = len(self.df)
            self.progress_bar["value"] = 0

            start_id = 0

            for i, (_, row) in enumerate(self.df.iterrows(), start=1):
                while self.paused:
                    self.progress_label.config(text="⏸️ متوقف مؤقتًا...", foreground="orange")
                    self.root.update()
                    progress_win.update()
                    time.sleep(1)

                phone = str(row["Phone"]).strip()
                message_text = (
                    self.message_entry.get("1.0", tk.END).strip()
                    if self.use_custom_message.get()
                    else str(row["Message"]).strip()
                )

                message_text = f"{message_text}\nweza#{start_id:04d}"
                start_id += 1

                try:
                    success = False
                    for attempt in range(2):
                        try:
                            search_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]')
                            search_box.clear()
                            search_box.send_keys(phone)
                            time.sleep(2)

                            try:
                                alert = driver.switch_to.alert
                                alert_text = alert.text
                                alert.accept()
                                failed_data.append({"Phone": phone, "Error": f"Alert appeared: {alert_text}"})
                                self.progress_label.config(text=f"❌ Alert: {phone}", foreground="red")
                                success = False
                                break
                            except:
                                pass

                            chat_results = driver.find_elements(By.XPATH, '//span[@title]')
                            if len(chat_results) == 0:
                                driver.get(f"https://web.whatsapp.com/send?phone={phone}&text=")
                                time.sleep(4)
                                try:
                                    alert = driver.switch_to.alert
                                    alert_text = alert.text
                                    alert.accept()
                                    failed_data.append({"Phone": phone, "Error": f"Alert appeared: {alert_text}"})
                                    self.progress_label.config(text=f"❌ Alert: {phone}", foreground="red")
                                    success = False
                                    break
                                except:
                                    pass
                            else:
                                chat_results[0].click()

                            time.sleep(1)
                            message_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]')
                            message_box.send_keys(message_text)
                            time.sleep(1)
                            message_box.send_keys(Keys.ENTER)
                            time.sleep(1)

                            try:
                                alert = driver.switch_to.alert
                                alert_text = alert.text
                                alert.accept()
                                failed_data.append({"Phone": phone, "Error": f"Alert appeared: {alert_text}"})
                                self.progress_label.config(text=f"❌ Alert: {phone}", foreground="red")
                                success = False
                                break
                            except:
                                pass

                            success = True
                            break

                        except Exception as e_inner:
                            last_error = e_inner

                    if success:
                        total_sent += 1
                    else:
                        if 'last_error' in locals():
                            failed_data.append({"Phone": phone, "Error": str(last_error)})

                except Exception as e_outer:
                    failed_data.append({"Phone": phone, "Error": str(e_outer)})
                    success = False

                self.progress_bar["value"] = i
                percent = (i / len(self.df)) * 100
                if success:
                    color = "green"
                    status_text = "✅ تم الإرسال"
                else:
                    color = "red"
                    status_text = f"❌ فشل الإرسال "

                self.progress_label.config(
                    text=f"{status_text} 📤 {i}/{len(self.df)} ({percent:.1f}%) إلى: {phone}",
                    foreground=color
                )
                progress_win.update()
                self.root.update()

                time.sleep(float(self.sleep_time.get()))

            driver.quit()

            self.total_sent += total_sent
            self.total_failed += len(failed_data)
            report_to_firebase(True, self.total_sent, self.total_failed)

            if len(failed_data) > 0:
                pd.DataFrame(failed_data).to_excel("failed_log.xlsx", index=False)

            result_text = f"📊 إرسال مكتمل\n\n✅ الناجحين: {total_sent}\n❌ الفاشلين: {len(failed_data)}\n"
            if len(failed_data) > 0:
                result_text += "\n📄 تم حفظ الفاشلين في failed_log.xlsx"

            ttk.Label(progress_win, text=result_text, background="#eef2f7", foreground="blue", font=("Arial", 11)).pack(pady=10)
            ttk.Button(progress_win, text="✅ إغلاق", command=progress_win.destroy).pack(pady=5)
            self.status_label.config(text="✅ تم الإرسال بالكامل", foreground="green")
            webbrowser.open("https://omarportfolios.vercel.app/")

        except Exception as main_error:
            messagebox.showerror("❌ خطأ", f"حدث خطأ أثناء الإرسال:\n{main_error}")

if __name__ == "__main__":
    root = tk.Tk()
    app = WhatsAppSenderApp(root)
    root.mainloop()
